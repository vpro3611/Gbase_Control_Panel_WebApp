import { OAuth2Client } from 'google-auth-library';
import { config } from '../../config/env';

export interface OAuthUserProfile {
  provider: 'google' | 'github';
  providerId: string;
  email: string;
}

export interface OAuthServiceInterface {
  verifyGoogleToken(tokenOrCode: string): Promise<OAuthUserProfile>;
  verifyGithubToken(tokenOrCode: string): Promise<OAuthUserProfile>;
}

export class OAuthService implements OAuthServiceInterface {
  private googleClient: OAuth2Client;

  constructor() {
    this.googleClient = new OAuth2Client(config.googleClientId, config.googleClientSecret);
  }

  async verifyGoogleToken(tokenOrCode: string): Promise<OAuthUserProfile> {
    try {
      // 1. Try verifying as Google ID Token using google-auth-library
      let googleId: string | undefined;
      let email: string | undefined;

      try {
        const ticket = await this.googleClient.verifyIdToken({
          idToken: tokenOrCode,
          audience: config.googleClientId || undefined,
        });
        const payload = ticket.getPayload();
        if (payload) {
          googleId = payload.sub;
          email = payload.email;
        }
      } catch {
        // 2. Fallback: try as Google OAuth2 access token via Google userinfo endpoint
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenOrCode}` },
        });

        if (userInfoRes.ok) {
          const userData = await userInfoRes.json();
          googleId = userData.sub;
          email = userData.email;
        }
      }

      if (!googleId || !email) {
        throw new Error('Google OAuth token could not be verified by Google servers');
      }

      return {
        provider: 'google',
        providerId: googleId,
        email: email.toLowerCase().trim(),
      };
    } catch (error: any) {
      throw new Error(`Google OAuth authentication failed: ${error.message}`);
    }
  }

  async verifyGithubToken(tokenOrCode: string): Promise<OAuthUserProfile> {
    try {
      let accessToken = tokenOrCode;

      // If tokenOrCode is an authorization code, exchange it for access token
      if (!tokenOrCode.startsWith('gho_') && !tokenOrCode.startsWith('ghp_')) {
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: config.githubClientId,
            client_secret: config.githubClientSecret,
            code: tokenOrCode,
          }),
        });

        const tokenData = await tokenRes.json();
        if (tokenData.error || !tokenData.access_token) {
          throw new Error(tokenData.error_description || 'Failed to exchange GitHub authorization code');
        }
        accessToken = tokenData.access_token;
      }

      // Fetch GitHub User Profile
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${accessToken}`,
          'User-Agent': 'GObase-Control-Panel',
        },
      });

      if (!userRes.ok) {
        throw new Error('Failed to fetch user profile from GitHub API');
      }

      const userData = await userRes.json();
      let email = userData.email;

      // If GitHub email is set to private in user profile, fetch primary email from emails endpoint
      if (!email) {
        const emailsRes = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `token ${accessToken}`,
            'User-Agent': 'GObase-Control-Panel',
          },
        });

        if (emailsRes.ok) {
          const emails: any[] = await emailsRes.json();
          const primaryEmail = emails.find((e: any) => e.primary && e.verified) || emails.find((e: any) => e.verified);
          if (primaryEmail) {
            email = primaryEmail.email;
          }
        }
      }

      if (!userData.id || !email) {
        throw new Error('GitHub account must have a verified email address');
      }

      return {
        provider: 'github',
        providerId: String(userData.id),
        email: email.toLowerCase().trim(),
      };
    } catch (error: any) {
      throw new Error(`GitHub OAuth authentication failed: ${error.message}`);
    }
  }
}

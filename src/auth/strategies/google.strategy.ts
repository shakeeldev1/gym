// src/auth/strategies/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    const clientID =
      process.env.GOOGLE_CLIENT_ID || configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret =
      process.env.GOOGLE_CLIENT_SECRET || configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL =
      process.env.GOOGLE_CALLBACK_URL || configService.get<string>('GOOGLE_CALLBACK_URL');

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Google OAuth env vars missing: set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['openid', 'profile', 'email'],
    } as any);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    const { id, emails, name, photos } = profile || {};
    const primaryEmail = Array.isArray(emails) && emails.length > 0 ? emails[0].value : undefined;
    const firstName = name?.givenName ?? '';
    const lastName = name?.familyName ?? '';
    const picture = Array.isArray(photos) && photos.length > 0 ? photos[0].value : undefined;

    const user = await this.authService.validateGoogleUser({
      googleId: id,
      email: primaryEmail,
      firstName,
      lastName,
      picture,
    });
    done(null, user);
  }
}

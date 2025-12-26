// src/auth/strategies/facebook.strategy.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    const clientID =
      process.env.FACEBOOK_APP_ID || configService.get<string>('FACEBOOK_APP_ID');
    const clientSecret =
      process.env.FACEBOOK_APP_SECRET || configService.get<string>('FACEBOOK_APP_SECRET');
    const callbackURL =
      process.env.FACEBOOK_CALLBACK_URL || configService.get<string>('FACEBOOK_CALLBACK_URL');

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Facebook OAuth env vars missing: set FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, FACEBOOK_CALLBACK_URL');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['public_profile'],
      profileFields: ['id', 'emails', 'name', 'photos'],
    } as any);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: Function,
  ): Promise<any> {
    const { id, emails, name, photos } = profile || {};
    const primaryEmail = Array.isArray(emails) && emails.length > 0 ? emails[0].value : `facebook_${id}@placeholder.local`;
    const firstName = name?.givenName ?? '';
    const lastName = name?.familyName ?? '';
    const picture = Array.isArray(photos) && photos.length > 0 ? photos[0].value : undefined;

    const user = await this.authService.validateFacebookUser({
      facebookId: id,
      email: primaryEmail,
      firstName,
      lastName,
      picture,
    });
    done(null, user);
  }
}

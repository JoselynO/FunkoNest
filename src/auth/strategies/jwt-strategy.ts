import { ExtractJwt } from "passport-jwt";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport";
import { AuthService } from "../auth.service";
import { Usuario } from "../../users/entities/user.entity";

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy){
  constructor(private readonly authService: AuthService){
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Buffer.from(
        process.env.TOKEN_SECRET || 'Me_Gustan_Los_Pepinos_De_Leganes_Porque_Son_Grandes_Y_Hermosos', 'utf-8',
      ).toString('base64'),
    });
  }

  async validate(payload: Usuario){
    const id = payload.id
    return await this.authService.validateUser(id);
  }
}
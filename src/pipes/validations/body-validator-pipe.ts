import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class BodyValidatorPipe implements PipeTransform {
  transform(body: any, metadata: ArgumentMetadata) {
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException('La solicitud no puede estar vacía');
    }
    return body;
  }
}

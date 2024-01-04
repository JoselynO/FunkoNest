import { ArgumentMetadata, BadRequestException, Injectable, ParseUUIDPipe, PipeTransform } from "@nestjs/common";

@Injectable()
export class UuidIdValidatorPipe implements PipeTransform {
  async transform(id: string, metadata: ArgumentMetadata) {
    const pipeUuid = new ParseUUIDPipe();
    try {
      return await pipeUuid.transform(id, metadata);
    } catch (error) {
      throw new BadRequestException('ID invalido o de formato incorrecto');
    }
  }
}

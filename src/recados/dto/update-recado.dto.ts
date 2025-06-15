import { PartialType } from '@nestjs/mapped-types';
import { CreateRecadoDto } from './create-recado.dto';

export class UpdateRecadoDto extends PartialType(CreateRecadoDto) {
  readonly texto?: string;
  readonly de?: string;
  readonly para?: string;
  readonly lido?: boolean;
}

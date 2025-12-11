import { IsMongoId } from "class-validator";

export class AddBlockDto {
  @IsMongoId()
  blockId: string;
}

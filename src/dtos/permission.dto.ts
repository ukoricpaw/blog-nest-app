import { IsNumber, IsString } from 'class-validator';
import { PERMISSIONS } from 'src/utils/define-permissions';

export default class PermissionDto {
  @IsNumber()
  public userId: number;
  @IsString()
  public permission: PERMISSIONS;
}

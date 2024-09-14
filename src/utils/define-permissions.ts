import { isFieldExistOtherwiseCreate } from './field-existance';
import PermissionEntity from 'src/models/permission.entity';

enum PERMISSIONS {
  OWNER = 'OWNER',
  MODIFY = 'MODIFY',
  READ = 'READ',
}

export default function definePermissions() {
  Object.values(PERMISSIONS).map(val => {
    isFieldExistOtherwiseCreate(val, PermissionEntity);
  });
}

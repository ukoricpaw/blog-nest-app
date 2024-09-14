import { Model } from 'sequelize-typescript';

export async function isFieldExistOtherwiseCreate<T extends typeof Model>(val: string, entity: T) {
  const instance = entity as any;
  const field = await instance.findOne({ where: { name: val } });
  if (!field) {
    instance.create({ name: val });
  }
}

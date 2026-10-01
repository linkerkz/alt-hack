const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// id из адреса похож на uuid: иначе база ответит ошибкой, а не «нет такого».
export function isUuid(id: string) {
  return UUID.test(id);
}

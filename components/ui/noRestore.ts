// Firefox помнит disabled у кнопки между перезагрузками и ломает гидратацию;
// autocomplete="off" это отключает. В типах React атрибута у кнопки нет,
// поэтому он передаётся разворотом объекта.
export const FIREFOX_NO_RESTORE = { autoComplete: "off" };

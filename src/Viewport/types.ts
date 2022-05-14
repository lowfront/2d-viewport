export type Function1<T> = (value: T) => T;
export type TypeOrFunction<T> = T|Function1<T>;
export type ViewportGridLine = [number, string];

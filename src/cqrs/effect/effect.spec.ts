import { createEffect } from './effect';

describe('effects', () => {
  it('should be able to create a simple effect', () => {
    const SomeEffect = createEffect<{ foo: string; bar: number }>(
      'SOME_EFFECT',
      'EFFECT',
    );
    const someEffect = SomeEffect({ foo: 'foo', bar: 1 });
    expect(someEffect).toEqual({
      payload: {
        bar: 1,
        foo: 'foo',
      },
      type: 'SOME_EFFECT',
      effectType: 'EFFECT',
    });
  });
});

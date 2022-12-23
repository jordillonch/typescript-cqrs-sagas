import { createCommand } from './command';

describe('commands', () => {
  it('should be able to create a simple command', () => {
    const SomeCommand = createCommand<{ foo: string; bar: number }>(
      'SOME_COMMAND',
    );
    const someCommand = SomeCommand({ foo: 'foo', bar: 1 });
    expect(someCommand.payload.bar).toEqual(1);
    expect(someCommand.payload.foo).toEqual('foo');
    expect(someCommand).toEqual({
      payload: {
        bar: 1,
        foo: 'foo',
      },
      type: 'SOME_COMMAND',
      effectType: 'COMMAND',
    });
  });
});

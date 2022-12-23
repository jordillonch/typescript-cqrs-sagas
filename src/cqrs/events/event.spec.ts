import { createEvent } from './event';

describe('events', () => {
  it('should be able to create a simple event', () => {
    const SomeEvent = createEvent<{ foo: string; bar: number }>('SOME_EVENT');
    const someEvent = SomeEvent({ foo: 'foo', bar: 1 });
    expect(someEvent.payload.bar).toEqual(1);
    expect(someEvent.payload.foo).toEqual('foo');
    expect(someEvent).toEqual({
      payload: {
        bar: 1,
        foo: 'foo',
      },
      type: 'SOME_EVENT',
      effectType: 'EVENT',
    });
  });
});

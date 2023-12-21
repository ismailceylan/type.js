import assert from "assert";
import { setPrototypeOf } from "../src/utils/index.js";

describe( "Utils", () =>
{
	it( "should set given object to [[Prototype]] when Object.setPrototypeOf is not available", () =>
	{
		const object = {}
		const proto = { foo: "foo" }
		const nativeSetPrototypeOf = Object.setPrototypeOf;

		delete Object[ "setPrototypeOf" ];

		setPrototypeOf( object, proto );

		assert.strictEqual( object.__proto__, proto );

		Object.setPrototypeOf = nativeSetPrototypeOf;
	});
});

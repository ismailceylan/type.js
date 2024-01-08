import assert from "assert";
import { Interface, Type } from "../src/index.js";
import {
	ArgumentTypeMismatch, MissingArgumentError, MissingMethodError,
	MissingPropError, PropAssignTypeMismatchError, PropTypeMismatchError, ReturnTypeMismatch
} from "../src/errors/index.js";

describe( "Interface Enforcements", () =>
{
	it( "shouldn't miss required props", () =>
		assert.throws(() =>
			Type( "type" )
				.implements( Interface( "iface", i =>
					i.property( "foo" ).required()
				))
				.body({})
			,
			MissingPropError
		)
	);

	it( "shouldn't miss methods", () =>
		assert.throws(
			() =>
				Type( "type" )
					.implements( Interface( "iface", i =>
						i.method( "foo", () => {})
					))
					.body({})
			,
			MissingMethodError
		)
	);

	it( "shouldn't miss required arguments", () =>
		assert.throws(
			() =>
				Type( "type" )
					.implements( Interface( "iface", i =>
						i.method( "foo", m => m.argument( "arg" ).required())
					))
					.body({ foo(){}})
			,
			MissingArgumentError
		)
	);

	it( "shouldn't miss required argument when calling method", () =>
		assert.throws(
			() =>
				Type( "type" )
					.implements( Interface( "iface", i =>
						i.method( "foo", m => m.argument( "arg", String ).required())
					))
					.body({ foo( arg ){}})
					.create()
					.foo()
			,
			ArgumentTypeMismatch
		)
	);

	it( "shouldn't create prop with unsupported type", () =>
		assert.throws(
			() =>
				Type( "type" )
					.implements( Interface( "iface", i =>
						i.property( "foo", String )
					))
					.body({ foo: 12 })
			,
			PropTypeMismatchError
		)
	);

	it( "shouldn't assign unsupported type to prop", () =>
		assert.throws(
			() =>
			{
				const instance = Type( "type" )
					.implements( Interface( "iface", i =>
						i.property( "foo", String )
					))
					.body({ foo: "" })
					.create();

				instance.foo = 12;
			},
			PropAssignTypeMismatchError
		)
	);

	it( "shouldn't pass unsupported argument type", () =>
		assert.throws(
			() =>
				Type( "type" )
					.implements( Interface( "iface", i =>
						i.method( "foo", m => m.argument( "x", [ String, Boolean ]))
					))
					.body({ foo( x ){}})
					.create()
					.foo( 12 )
			,
			ArgumentTypeMismatch
		)
	);

	it( "methods shouldn't return unsupported type", () =>
		assert.throws(
			() =>
				Type( "type" )
					.implements( Interface( "iface", i =>
						i.method( "foo", m => m.returns( Array ))
					))
					.body({ foo: () => "" })
					.create()
					.foo()
			,
			ReturnTypeMismatch
		)
	);

	it( "methods should receive default when it left empty", () =>
		assert.strictEqual(
			Type( "type" )
				.implements( Interface( "iface", i =>
					i.method( "foo", m => m.argument( "x" ).default( 12 ))
				))
				.body({ foo: x => x })
				.create()
				.foo()
			,
			12
		)
	);
});

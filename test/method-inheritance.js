import { Trait, Type } from "../src/index.js";
import assert from "assert";

const Can = Trait( "Can" ).body(
{
	can()
	{
		return "can";
	}
});

const ReallyCan = Trait( "ReallyCan" ).uses( Can ).body(
{
	reallyCan()
	{
		return "reallyCan";
	}
});

const Parent = Type( "Parent" ).body(
{
	getParentScope()
	{
		return this;
	},

	overrideable()
	{
		return "parent";
	},

	extendable()
	{
		return "parent";
	},

	receivesArg( arg )
	{
		return arg;
	},

	parent()
	{
		return "parent";
	},

	shouldNotUseParent()
	{
		return parent();
	}
});

const Child = Type( "Child" ).extends( Parent ).body(
{
	getChildScope()
	{
		return this;
	},

	overrideable()
	{
		return "child";
	},

	extendable()
	{
		return parent() + ">child";
	},

	passessArgs( arg )
	{
		return parent( "receivesArg", [ arg ]);
	},

	canAccessAnyFromParent()
	{
		return parent( "parent" );
	}
});

const child = Child.create();

describe( "Method Inheritance", () =>
{
	it( "parent's method scope should refers to the instance", () =>
		assert.deepEqual( child.getParentScope(), child )
	);
	
	it( "child's method scope should refers to the instance", () =>
		assert.deepEqual( child.getChildScope(), child )
	);

	it( "overrided methods shouldn't run when they called", () =>
		assert.equal( child.overrideable(), "child" )
	);

	it( "child methods should be able to access parent methods", () =>
		assert.equal( child.extendable(), "parent>child" )
	);

	it( "child can be able to pass arguments to parent methods", () =>
		assert.equal( child.passessArgs( "foo" ), "foo" )
	);

	it( "child method should be able to access any parent method", () =>
		assert.equal( child.canAccessAnyFromParent(), "parent" )
	);

	it( "using parent in parentless type methods should throw", () =>
		assert.throws(() => child.shouldNotUseParent(), ReferenceError )
	);
});

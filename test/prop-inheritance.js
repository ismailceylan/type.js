import { Trait, Type } from "../src/index.js";
import assert from "assert";

const Parent = Type( "Parent" ).body(
{
	parent: "parent",
	common: "common from parent"
});

const Child = Type( "Child" ).extends( Parent ).body(
{
	child: "child",
	common: "common from child"
});

describe( "Property Inheritance", () =>
{
	it( "child props should be available directly on the instance", () =>
		assert.equal( Child.create().hasOwnProperty( "child" ), true )
	);

	it( "parent props should be available directly on the instance", () =>
		assert.equal( Child.create().hasOwnProperty( "parent" ), true )
	);

	it( "common props should be overrided by childs", () =>
		assert.equal( Child.create().common, "common from child" )
	);

});

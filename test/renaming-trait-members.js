import { Trait, Type } from "../src/index.js";
import assert from "assert";

const Can = Trait( "Can" ).body(
{
	foo: "foo",
	moo: () => "moo"
});

const Can2 = Trait( "Can2" ).uses( Can, { foo: "zoo", moo: "boo" });
const Parent = Type( "Parent" ).uses( Can2, { zoo: "prop", boo: "method" });

const instance = Parent.create();

describe( "Renaming Trait Prop And Method Names", () =>
{
	it( "parent trait should be able to rename props", () =>
	{
		assert.equal( "zoo" in Can2.properties, true );
		assert.equal( Can2.properties.zoo, "foo" );
	});
	
	it( "parent trait should be able to rename methods", () =>
	{
		assert.equal( "boo" in Can2.properties, true );
		assert.equal( Can2.properties.boo(), "moo" );
	});

	it( "type should be able to rename trait props that already renamed", () =>
	{
		assert.equal( "prop" in instance, true );
		assert.equal( instance.prop, "foo" );

		assert.equal( "method" in instance, true );
		assert.equal( instance.method(), "moo" );
	});
});

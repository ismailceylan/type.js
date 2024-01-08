import { Trait, Type } from "../src/index.js";
import assert from "assert";

const Trait1 = Trait( "Trait1" ).body(
{
	construct()
	{
		this.propFromTrait = true;
	}
});

const Type1 = Type( "Type1" ).body(
{
	construct()
	{
		this.propFromType = true;
	}
});

const Type2 = Type( "Type2" ).uses( Trait1 );

const instance1 = Type1.create();
const instance2 = Type2.create();

describe( "Type Construct", () =>
{
	it( "type construct method should run when instantiated", () =>
		assert.equal( "propFromType" in instance1, true )
	);

	it( "construct method from traits should run when instantiated", () =>
		assert.equal( "propFromTrait" in instance2, true )
	);

});

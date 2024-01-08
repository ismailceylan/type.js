import { Trait, Type } from "../src/index.js";
import assert from "assert";

const Parent = Type( "Parent" ).abstract();
const Child = Type( "Child" ).extends( Parent );

describe( "Abstract Type", () =>
{
	it( "Abstract types should not be instantiated", () =>
		assert.throws(() => Parent.create(), TypeError )
	);

});

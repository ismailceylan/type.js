import assert from "assert";
import { Type } from "../src/index.js";

it( "should throw TypeError for invalid type names", () =>
	assert.throws(() => Type( "foo bar" ), TypeError )
);

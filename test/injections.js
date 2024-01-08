import { Trait, Type } from "../src/index.js";
import assert from "assert";

const subject = Symbol( "injected" );

const Can = Trait( "Can" ).inject({ subject });

const Injects = Type( "Injects" ).inject({ subject }).body(
{
	canAccess()
	{
		return subject;
	}
});

const NotInjects = Type( "NotInjects" ).body(
{
	cantAccess()
	{
		return subject;
	}
});

const InheritsInjections = Type( "Inherits" ).uses( Can ).body(
{
	canAccess()
	{
		return subject;
	}
})

describe( "Accesing Global Scope From Type And Trait Methods", () =>
{
	it( "should access injected variables", () =>
		assert.deepEqual( Injects.create().canAccess(), subject )
	);

	it( "shouldn't be able to access uninjected variables", () =>
		assert.throws(() => NotInjects.create().cantAccess(), ReferenceError )
	);

	it( "should access used trait's injections", () =>
		assert.deepEqual( InheritsInjections.create().canAccess(), subject )
	);
});

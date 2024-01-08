import assert from "assert";
import { Interface, Trait, Type } from "../src/index.js";

const TraitA = Trait( "TraitA" );
const TraitB = Trait( "TraitB" ).uses( TraitA );

const IFaceA = Interface( "IFaceA" );
const IFaceB = Interface( "IFaceB" ).extends( IFaceA );

const TypeA = Type( "TypeA" ).implements( IFaceB ).uses( TraitB );
const TypeB = Type( "Typeb" ).extends( TypeA );

const instance = TypeB.create();

describe( "Is A Relations", () =>
{
	describe( "Between Types", () =>
	{
		it( "Child should be instanceof Parent", () =>
			assert.equal( TypeB instanceof TypeA, true )
		);

		it( "Parent shouldn't be instanceof Child", () =>
			assert.equal( TypeA instanceof TypeB, false )
		);
	});

	describe( "Between Traits", () =>
	{
		it( "Child should be instanceof Parent", () =>
			assert.equal( TraitB instanceof TraitA, true )
		);

		it( "Parent shouldn't be instanceof Child", () =>
			assert.equal( TraitA instanceof TraitB, false )
		);
	});

	describe( "Between Interfaces", () =>
	{
		it( "Child should be instanceof Parent", () =>
			assert.equal( IFaceB instanceof IFaceA, true )
		);

		it( "Parent shouldn't be instanceof Child", () =>
			assert.equal( IFaceA instanceof IFaceB, false )
		);
	});

	describe( "Cross Relations", () =>
	{
		it( "Type should be instanceof Interface", () =>
			assert.equal( TypeA instanceof IFaceB, true )
		);

		it( "Type should be instanceof indirect Interface", () =>
			assert.equal( TypeA instanceof IFaceA, true )
		);
	});

	describe( "Instance Relations", () =>
	{
		it( "instance should be instanceof Type", () =>
			assert.equal( instance instanceof TypeB, true )
		);

		it( "instance should be instanceof Trait", () =>
			assert.equal( instance instanceof TraitA, true )
		);

		it( "instance should be instanceof Interface", () =>
			assert.equal( instance instanceof IFaceA, true )
		);

		it( "Type instanceof instance should throw TypeError", () =>
			assert.throws(() =>
				TypeA instanceof instance,
				TypeError
			)
		);
	});
});

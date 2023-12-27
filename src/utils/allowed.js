import { typeName } from "./index.js";

export default function allowed( value, types )
{
	const valueTag = typeName( value );

	for( let type of types )
	{
		let typeTag = typeName( type );

		if( typeTag == "Function" )
		{
			typeTag = type.prototype.constructor.name;
		}

		if( valueTag == typeTag )
		{
			return true;
		}
	}

	return false;
}

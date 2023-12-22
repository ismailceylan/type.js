import { typeName } from "./index.js";

export default function allowed( value, types )
{
	for( const type of types )
	{
		if( typeName( value ) == type.prototype.constructor.name )
		{
			return true;
		}
	}

	return false;
}

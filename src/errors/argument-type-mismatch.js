import { readableJoin, typeName, typeNames } from "../utils/index.js";

export default class ArgumentTypeMismatch extends Error
{
	constructor( iface, type, methodRule, argRule, position, value )
	{
		super();

		this.name = "ArgumentTypeMismatch";

		this.message = `${ iface.name } interface requires ${ type.name }.${ methodRule.name } method's ${ position }st argument (#${ argRule.name }) must be ${ argRule.types.length === 0? "defined" : readableJoin( typeNames( argRule.types )).toLowerCase()} but received ${ typeName( value ).toLowerCase()}.`;
	}
}

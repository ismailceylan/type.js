import { typeName, typeNames, readableJoin } from "../utils/index.js";

export default class PropTypeMismatchError extends TypeError
{
	constructor( iface, type, rule, propValue )
	{
		super();

		this.name = "PropTypeMismatchError";
		this.message = `${ iface.name } interface requires ${ type.name }.${ rule.name } property should ${ readableJoin( typeNames( rule.types ))} but it was ${ typeName( propValue )}.`;
	}
}

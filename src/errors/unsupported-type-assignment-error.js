import { typeName, typeNames, readableJoin } from "../utils/index.js";

export default class UnsupportedTypeAssignmentError extends TypeError
{
	constructor( iface, type, rule, propValue )
	{
		super();

		this.name = "UnsupportedTypeAssignmentError";
		this.message = `${ iface.name } interface requires the ${ type.name }.${ rule.name } property should ${ readableJoin( typeNames( rule.types ))} but attempted to assign ${ typeName( propValue )}.`;
	}
}

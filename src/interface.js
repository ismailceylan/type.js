import { ImplError } from "./errors/index.js";
import { args, getArguments, typeName } from "./utils/index.js";

/**
 * Creates interfaces.
 * 
 * @param {Function} builder ınterface builder method
 */
export default function Interface( name, builder )
{
	var iface = {}
	
	builder({ method: method, property: property });

	if( Symbol )
	{
		Object.defineProperty( iface, Symbol.toStringTag, { value: "Interface" });
	}

	Object.defineProperty( iface, "name", { value: name });
	Object.defineProperty( iface, "apply",
	{
		value: function( type )
		{
			for( var key in this )
			{
				var prop = this[ key ];

				// property checking
				if( prop instanceof property )
				{
					var required = true;
					var existanceChecked = false;
					var allowedTypeName = typeName( prop.types );

					// allowing single or multiple types
					if( allowedTypeName == "Array" || allowedTypeName == "Function" )
					{
						checkPropValid( type, prop, prop.types );
					}
					// full detail type (default, required etc)
					else if( allowedTypeName == "Object" )
					{
						// required checking
						if( prop.types.required )
						{
							// existance checking
							checkExistance( type, prop );
							existanceChecked = true;
						}
						else
						{
							required = false;
						}

						// if prop required but already exist or
						// its not even required then we end up this line
						// either way we should check if its value valid
						if( has( type, prop ))
						{
							checkPropValid( type, prop, prop.types.type );
						}
					}

					// prop is required and not existance checked
					if( required && ! existanceChecked )
					{
						checkExistance( type, prop );
					}
				}
				else if( prop instanceof method )
				{
					// methods are required let's check it
					checkExistance( type, prop );

					var underhoodMethod = type.constructor.prototype[ prop.name ];
					var definedArgs = getArguments( underhoodMethod.toString());
					var argRules = prop.args;

					// does method definition satisfies argument
					// requirements forced by this interface?
					for( var i = 0; i < argRules.length; i++ )
					{
						var rule = argRules[ i ];

						if( rule.required && definedArgs[ i ] === undefined )
						{
							throw new ImplError(
								`The ${ type.name }.${ prop.name } method requires an argument defined position at: ${ i }`
							);
						}
					}

					// we will place a proxy method instead of the real
					// method and keep the incoming argument and returned
					// value types under control on runtime
					type.constructor.prototype[ prop.name ] = function interfaceCapsule()
					{
						var receivedArgs = args( arguments );

						for( var i = 0; i < argRules.length; i++ )
						{
							var rule = argRules[ i ];
							var definedArg = definedArgs[ i ];
							var receivedArg = receivedArgs[ i ];

							// if interface defines a default value when it's 
							// value not set we can inject that default
							if( receivedArg === undefined && "default" in rule )
							{
								receivedArgs[ i ] = receivedArg = rule.default;
							}

							// we are sure default value applied received argument
							// value if received still undefined and the argument 
							// required then that's a problem that we have to catch
							if( rule.required && receivedArg === undefined )
							{
								throw new ImplError(
									`When calling the ${ type.name }.${ prop.name } method, you gave the value of the argument named "${ definedArg }" at position "${ i }" undefined, and it expects a ${ classNames( rule.types ).join( " or " )} value instead!`
								);
							}

							var receivedArgSatisfiesRule = false;
							var receivedArgTypeName = typeName( receivedArg );

							for( var item of rule.types )
							{
								if( receivedArgTypeName == className( item ))
								{
									receivedArgSatisfiesRule = true;
									break;
								}
							}

							if( ! receivedArgSatisfiesRule )
							{
								throw new ImplError(
									`The ${ type.name }.${ prop.name } method's argument ${ i } (${ definedArg }) expects ${ classNames( rule.types ).join( " or " )} instead of ${ receivedArgTypeName }!`
								);
							}
						}

						var returnValue = underhoodMethod.apply( this, receivedArgs );
					}
				}
			}
		}
	});

	function property( name, types )
	{
		if( this instanceof property )
		{
			this.name = name;
			this.types = types;
		}
		else
		{
			iface[ name ] = new property( name, types );
			return this;
		}
	}

	function method( name, builder )
	{
		if( this instanceof method )
		{
			var _method = this;

			this.name = name;
			this.args = [];
			this.returns = undefined;
		
			builder({ argument: argument, returns: returns });

			function returns( types )
			{
				_method.returns = types;
			}

			function argument( types )
			{
				if( this instanceof argument )
				{
					this.required = false;
					this.default = undefined;
					this.types = typeName( types ) == "Array"
						?   types
						: [ types ];
				}
				else
				{
					var arg = new argument( types );

					_method.args.push( arg );

					return {
						required: function()
						{
							arg.required = true;
							return this;
						},

						default: function( value )
						{
							arg.default = value;
							return this;
						}
					}
				}
			}
		}
		else
		{
			iface[ name ] = new method( name, builder );
			return this;
		}
	}

	function getRuleType( prop )
	{
		return prop instanceof property
			? "property"
			: prop instanceof method
				? "method"
				: "";
	}

	function isPropValid( type, prop, alloweds )
	{
		var hasMatch = false;
		var sourceTypeName = valueType( type, prop );

		for( var targetType of alloweds )
		{
			var targetTypeName = className( targetType );

			if( sourceTypeName == targetTypeName )
			{
				hasMatch = true;
				break;
			}
		}

		return hasMatch;
	}

	function checkPropValid( type, prop, alloweds )
	{
		alloweds = typeName( alloweds ) == "Array"
			?   alloweds
			: [ alloweds ];

		if( ! isPropValid( type, prop, alloweds ))
		{
			throw new ImplError(
				`${ type.name }.${ prop.name } property should be ${ classNames( alloweds ).join( " or " )}, instead of ${ valueType( type, prop )}!`
			);
		}
	}

	function checkExistance( type, prop )
	{
		if( ! has( type, prop ))
		{
			throw new ImplError(
				`The "${ iface.name }" interface requires that the "${ prop.name }" ${ getRuleType( prop )} defined on "${ type.name }" type!`
			);
		}
	}

	function value( type, name )
	{
		return type.constructor.prototype[ name ];
	}

	function valueType( type, rule )
	{
		return typeName( value( type, rule.name ));
	}

	function className( fn )
	{
		return fn.prototype.constructor.name;
	}

	function classNames( classes )
	{
		var stack = [];

		for( var clas of classes )
		{
			stack.push( className( clas ));
		}

		return stack;
	}

	function has( type, prop )
	{
		return prop.name in type.constructor.prototype;
	}

	return iface;
}

import { Builder } from "./index.js";
import { args, getArguments, typeName } from "../utils/index.js";
import {
	MissingArgumentError, PropAssignTypeMismatchError,
	MissingMethodError, MissingPropError, PropTypeMismatchError,
	ArgumentTypeMismatch, ReturnTypeMismatch
} from "../errors/index.js";

export default function Interface( name, build )
{
	if( ! ( this instanceof Interface ))
	{
		return new Interface( name, build );
	}

	var builder = new Builder;

	if( build )
	{
		build( builder );
	}

	/**
	 * Interface name.
	 * 
	 * @type {String}
	 */
	this.name = name;

	/**
	 * Interface properties.
	 * 
	 * @type {Object}
	 */
	this.properties = builder.properties;

	/**
	 * Interface methods.
	 * 
	 * @type {Object}
	 */
	this.methods = builder.methods;

	/**
	 * Extended interface list.
	 * 
	 * @type {Array}
	 */
	this.interfaces = [ this ];

	/**
	 * Applies the represented Interface to a given Type object.
	 * 
	 * @param {Type} type a type object to apply this interface
	 */
	this.apply = function( type )
	{
		validateProperties.call( this, type );
		validateMethods.call( this, type );
	}

	/**
	 * Extends the existing interface with the given interface.
	 * 
	 * @param {...Interface} interfaces interface to extend
	 * @return {Interface}
	 */
	this.extends = function()
	{
		var interfaces = args( arguments );

		for( var targetInterface of interfaces )
		{
			Object.defineProperties(
				this.methods,
				Object.getOwnPropertyDescriptors( targetInterface.methods )
			);
	
			Object.defineProperties(
				this.properties,
				Object.getOwnPropertyDescriptors( targetInterface.properties )
			);

			this.interfaces.push( targetInterface );
		}

		return this;
	}

	/**
	 * It takes the method that creates the interface rules and
	 * runs it, and the rules created by the developer are turned
	 * into objects that are easy to read and manipulate.
	 * 
	 * @param {Function} build interface builder method
	 * @returns {Interface}
	 */
	this.prototype = function( build )
	{
		build( builder );
		return this;
	}

	/**
	 * Tells whether the represented interface inherits the
	 * given interface.
	 * 
	 * @param {Interface} Interface an interface to check
	 * @returns {Boolean}
	 */
	this.is = function( Interface )
	{
		for( var iface of this.interfaces )
		{
			if( iface === Interface )
			{
				return true;
			}
		}

		return false;
	}

	function validateProperties( type )
	{
		for( var ruleName in this.properties )
		{
			var rule = this.properties[ ruleName ];
			var name = rule.name;
			var allows = rule.types;
			var required = rule.isRequired;
			var defined = name in type.properties;
			var value = type.properties[ name ];
			var restricted = allows.length > 0;

			// checking if prop needs to be defined
			if( required && ! defined )
			{
				// prop not defined directly on type
				throw new MissingPropError( this, type, rule );
			}

			// type checking
			if( defined && restricted && ! allowed( value, allows ))
			{
				throw new PropTypeMismatchError( this, type, rule, value );
			}

			// if prop restricted for specific types
			// we have to observe future writings
			if( restricted )
			{
				var iface = this;

				Object.defineProperty( type.properties, name,
				{
					get: function()
					{
						return value;
					},
	
					set: function( v )
					{
						if( ! allowed( v, allows ))
						{
							throw new PropAssignTypeMismatchError( iface, type, rule, v );
						}

						value = v;
					}
				});
			}
		}
	}

	function validateMethods( type )
	{
		for( var ruleName in this.methods )
		{
			var methodRule = this.methods[ ruleName ];
			var methodName = methodRule.name;
			var method = type.methods[ methodName ];
			var defined = methodName in type.methods;
			var definedArgs = getArguments( method.toString());
			var returns = methodRule.returnTypes;

			// methods are required
			if( ! defined )
			{
				throw new MissingMethodError( this, type, methodRule );
			}

			for( var i = 0; i < methodRule.arguments.length; i++ )
			{
				var argRule = methodRule.arguments[ i ];
				var argNameInDefinition = definedArgs[ i ];
				var required = argRule.isRequired;

				// argument is required and not defined on the method
				if( required && argNameInDefinition === undefined )
				{
					throw new MissingArgumentError( this, type, methodRule, argRule, i );
				}
			}

			// to observe argument types on runtime we have to
			// proxify the original method so we can keep under
			// control what is coming and even returning
			var proxifiedMethod = type.methods[ methodName ];

			function interfaceProxy()
			{
				var receivedArgs = args( arguments );

				for( var i = 0; i < methodRule.arguments.length; i++ )
				{
					var argRule = methodRule.arguments[ i ];
					var required = argRule.isRequired;
					var argDefault = argRule.defaultValue;
					var receivedArg = receivedArgs[ i ];
					var argNameInRule = argRule.name;
					var argNameInDefinition = definedArgs[ i ];
					var allows = argRule.types;
					var restricted = allows.length > 0;

					// if the argument required but not received any value
					if( required && receivedArg === undefined )
					{
						// If a default value is defined we will use it  
						if( argDefault !== undefined )
						{
							receivedArgs[ i ] = receivedArg = argDefault;
						}
						else
						{
							throw new ArgumentTypeMismatch( iface, type, methodRule, argRule, i );
						}
					}
					else if( restricted && ! allowed( receivedArg, allows ))
					{
						throw new ArgumentTypeMismatch( iface, type, methodRule, argRule, i, receivedArg );
					}
				}

				var returnValue = proxifiedMethod.apply( this, receivedArgs );

				if( returns.length > 0 && ! allowed( returnValue, returns ))
				{
					throw new ReturnTypeMismatch( iface, type, methodRule, returnValue );
				}

				return returnValue;
			}

			interfaceProxy.dependencies =
			{
				args: args,
				type: type,
				iface: this,
				returns: returns,
				allowed: allowed,
				methodRule: methodRule,
				definedArgs: definedArgs,
				proxifiedMethod: proxifiedMethod,
				ReturnTypeMismatch: ReturnTypeMismatch,
				ArgumentTypeMismatch: ArgumentTypeMismatch,
			}

			type.methods[ methodName ] = interfaceProxy;
		}
	}
}

function allowed( value, types )
{
	for( var type of types )
	{
		if( typeName( value ) == type.prototype.constructor.name )
		{
			return true;
		}
	}

	return false;
}

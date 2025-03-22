CREATE OR REPLACE FUNCTION public.usuario_crear(
	_usunombre character varying,
	_usuemail character varying,
	_usupassword character varying)
    RETURNS uuid
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
/*
 * Author: ASPTools
 * Create date: 2024-10-01 14:18:38.244587
 * Description: Procedimiento para la creación de registros 
 *              en la tabla usuario
 * ProcedureName: usuario_Crear
 * ASPTools:

/*ASPTools usuid ASPTools*/ 
/*ASPTools usunombre ASPTools*/ 
/*ASPTools usuemail ASPTools*/ 
/*ASPTools usupassword ASPTools*/  

*/
DECLARE
  _usuid uuid;
BEGIN
    INSERT INTO usuario(usuid,usunombre,usuemail,usupassword)
    VALUES (DEFAULT,_usunombre,_usuemail,_usupassword)
    RETURNING usuid INTO _usuid;
    RETURN _usuid;
END;
$BODY$;
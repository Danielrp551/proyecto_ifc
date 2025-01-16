import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hash } from "bcrypt";

const handleCreateUser = async () => {
  try {
    // Hashear el username para usarlo como contraseña
    const hashedPassword = await bcrypt.hash(newUser.username, 10);

    const response = await fetch(`/api/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...newUser,
        password: hashedPassword, // Enviar la contraseña hasheada
      }),
    });

    if (response.ok) {
      setSnackbar({
        open: true,
        message: "Usuario creado con éxito",
        severity: "success",
      });
      setModalOpen(false);
      setRefresh(!refresh); // Refresca la lista de usuarios
      setNewUser({
        nombre: "",
        primerApellido: "",
        segundoApellido: "",
        celular: "",
        email: "",
        rol: "",
      });
    } else {
      const errorData = await response.json();
      setSnackbar({
        open: true,
        message: errorData.message || "Error al crear el usuario",
        severity: "error",
      });
    }
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    setSnackbar({
      open: true,
      message: "Error interno del servidor",
      severity: "error",
    });
  }
};


export async function GET(request) {
  try {
    const { search = "", page = "1", pageSize = "10", rol = "" } = Object.fromEntries(new URL(request.url).searchParams);

    // Convertir `page` y `pageSize` a números
    const pageNumber = parseInt(page, 10);
    const pageSizeNumber = parseInt(pageSize, 10);

    // Calcular el desplazamiento
    const skip = (pageNumber - 1) * pageSizeNumber;

    // Construir el filtro de búsqueda
    const searchFilter = search
      ? {
          OR: [
            { username: { contains: search, mode: "insensitive" } },
            { asesor: { nombre: { contains: search, mode: "insensitive" } } },
            { asesor: { primer_apellido: { contains: search, mode: "insensitive" } } },
            { asesor: { segundo_apellido: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {};

    // Filtro por rol
    const rolFilter = rol
      ? {
          roles: {
            nombre_rol: rol,
          },
        }
      : {};

    // Obtener todos los usuarios con la información de asesor y rol
    const usuarios = await prisma.usuario.findMany({
      where: {
        AND: [rolFilter, searchFilter],
      },
      skip: skip,
      take: pageSizeNumber,
      select: {
        usuario_id: true,
        username: true,
        activo: true,
        roles: {
          select: {
            nombre_rol: true,
            descripcion: true,
          },
        },
        asesor: {
          select: {
            asesor_id: true,
            nombre: true,
            primer_apellido: true,
            segundo_apellido: true,
            celular: true,
            num_leads: true,
          },
        },
      },
      orderBy: {
        username: "asc",
      },
    });

    // Contar el total de usuarios para la paginación
    const totalUsuarios = await prisma.usuario.count({
      where: {
        AND: [rolFilter, searchFilter],
      },
    });

    return NextResponse.json({
      usuarios,
      totalUsuarios,
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      { message: "Error interno del servidor al obtener usuarios" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
    try {
      const body = await request.json();
      const { usuario_id, nombre, primerApellido, segundoApellido, username, rol } = body;
  
      // Validación de datos
      if (!usuario_id || !nombre || !primerApellido || !username || !rol) {
        return NextResponse.json(
          { message: "Todos los campos son obligatorios" },
          { status: 400 }
        );
      }
  
      // Buscar el `rol_id` correspondiente al `nombre_rol`
      const role = await prisma.roles.findUnique({
        where: {
          nombre_rol: rol,
        },
      });
  
      if (!role) {
        return NextResponse.json(
          { message: "El rol especificado no existe" },
          { status: 400 }
        );
      }
  
      // Actualizar la información en la tabla `usuario`
      await prisma.usuario.update({
        where: {
          usuario_id: usuario_id,
        },
        data: {
          username: username,
          rol_id: role.rol_id, // Actualización del rol
        },
      });
  
      // Actualizar la información en la tabla `asesor` (si es un asesor)
      await prisma.asesor.updateMany({
        where: {
          usuario_id: usuario_id,
        },
        data: {
          nombre: nombre,
          primer_apellido: primerApellido,
          segundo_apellido: segundoApellido,
        },
      });
  
      return NextResponse.json({ message: "Usuario actualizado con éxito" });
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      return NextResponse.json(
        { message: "Error interno del servidor al actualizar el usuario" },
        { status: 500 }
      );
    }
  }

  export async function PATCH(request) {
    try {
      const body = await request.json();
      const { usuario_id, activo } = body; 
  
      if (!usuario_id) {
        return NextResponse.json({ message: "El ID del usuario es obligatorio" }, { status: 400 });
      }
  
      // Cambiar el estado `activo` en la tabla `usuario`
      await prisma.usuario.update({
        where: { usuario_id },
        data: { activo: activo }, // Se actualiza el campo `activo`
      });
  
      const estado = activo ? "habilitado" : "inhabilitado";
      return NextResponse.json({ message: `Usuario ${estado} con éxito` });
    } catch (error) {
      console.error("Error al actualizar el estado del usuario:", error);
      return NextResponse.json({ message: "Error interno del servidor al actualizar el estado del usuario" }, { status: 500 });
    }
  }

  export async function POST(request) {
    try {
      const body = await request.json();
      const {
        nombre,
        primerApellido,
        segundoApellido = "",
        celular,
        email,
        rol,
      } = body;
      
      const username = email;
  
      // Validación de datos obligatorios
      if (!nombre || !primerApellido || !celular || !email || !rol) {
        return NextResponse.json(
          { message: "Todos los campos obligatorios deben ser completados" },
          { status: 400 }
        );
      }
  
      // Buscar el `rol_id` correspondiente al `nombre_rol`
      const role = await prisma.roles.findUnique({
        where: {
          nombre_rol: rol,
        },
      });
      console.log(role);
  
      if (!role) {
        return NextResponse.json(
          { message: "El rol especificado no existe" },
          { status: 400 }
        );
      }

      const existeUsuario = await prisma.usuario.findUnique({
        where: { username: username },
      });
      if(existeUsuario) {
        return NextResponse.json(
          { message: "El usuario ya existe" },
          { status: 400 }
        );
      }
  
      const hashedPassword = await hash(username, 10);
      console.log("Contraseña hasheada:", hashedPassword);

      // Crear el usuario en la tabla `usuario`
      const nuevoUsuario = await prisma.usuario.create({
        data: {
          username: username,
          rol_id: role.rol_id, // Asociar el rol
          activo: 1, // Por defecto, el usuario está habilitado
          password: hashedPassword, // Contraseña por defecto
        },
      });
  
      // Crear la información adicional en la tabla `asesor` si aplica
      const nuevoAsesor = await prisma.asesor.create({
        data: {
          usuario_id: nuevoUsuario.usuario_id, // Asociar el ID del usuario
          nombre: nombre,
          primer_apellido: primerApellido,
          segundo_apellido: segundoApellido,
          celular: celular,
          num_leads: 0, // Valor inicial por defecto
        },
      });
  
      return NextResponse.json({
        message: "Usuario creado con éxito",
        usuario: nuevoUsuario,
        asesor: nuevoAsesor,
      });
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      return NextResponse.json(
        { message: "Error interno del servidor al crear el usuario" },
        { status: 500 }
      );
    }
  }
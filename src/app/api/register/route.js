export const runtime = 'nodejs';

import prisma from "@/lib/db";
import { hash } from "bcrypt";

export async function POST(req) {
  try {
    const data = await req.json();
    console.log("Data recibida:", data);
    const { email, password, nombre, primer_apellido, segundo_apellido, celular } = data;
    
    // Verificar si el usuario ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { username: email }
    });
    console.log("Usuario encontrado:", existingUser);
    
    if (existingUser) {
      return new Response(JSON.stringify({ message: "El usuario ya existe" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    
    // Hashear la contraseña
    const hashedPassword = await hash(password, 10);
    console.log("Contraseña hasheada:", hashedPassword);
    // Crear el nuevo usuario y el asesor asociado
    /*
    await prisma.usuario.create({
      data: {
        username: email,
        password: hashedPassword,
        asesor: {
          create: {
            nombre: nombre,
            primer_apellido: primer_apellido,
            segundo_apellido: segundo_apellido,
            celular: celular
          }
        }
      }
    });
    */
    const newUser = await prisma.usuario.create({
        data: {
          username: email,
          password: hashedPassword
        }
    });
      
    await prisma.asesor.create({
        data: {
            nombre,
            primer_apellido,
            segundo_apellido,
            celular,
            usuario_id: newUser.usuario_id
        }
    });
    
    return new Response(JSON.stringify({ message: "Usuario y asesor registrados con éxito" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ message: "Error interno al registrar el usuario" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

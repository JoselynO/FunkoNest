import { CreateUserDto } from "../dto/create-user.dto";
import { Usuario } from "../entities/user.entity";
import { Injectable } from "@nestjs/common";
import { UserRole } from "../entities/user-role.entity";
import { UserDto } from "../dto/user-response.dto";

@Injectable()
export class UsuariosMapper {
  toResponseDto(user: Usuario): UserDto {
    const userDto = new UserDto();
    userDto.id = user.id
    userDto.nombre = user.nombre
    userDto.apellidos = user.apellidos
    userDto.username = user.username
    userDto.email = user.email
    userDto.createdAt = user.createdAt
    userDto.updatedAt = user.updatedAt
    userDto.isDeleted = user.isDeleted
    userDto.roles = user.roles.map((role) => role.role)
    return userDto
  }

  toResponseDtoWithRoles(user: Usuario, roles: UserRole[]){
    const userDto = new UserDto();
    userDto.id = user.id;
    userDto.nombre = user.nombre
    userDto.apellidos = user.apellidos
    userDto.username = user.username
    userDto.email = user.email
    userDto.createdAt = user.createdAt
    userDto.updatedAt = user.updatedAt
    userDto.isDeleted = user.isDeleted
    userDto.roles = roles.map((role) => role.role)
    return userDto
  }

  toEntity(createUserDto: CreateUserDto){
    const usuario = new Usuario();
    usuario.nombre = createUserDto.nombre;
    usuario.apellidos = createUserDto.apellidos
    usuario.email = createUserDto.email
    usuario.username = createUserDto.username
    usuario.password = createUserDto.password
    usuario.createdAt = new Date()
    usuario.updatedAt = new Date()
    usuario.isDeleted = false
    return usuario
  }
}
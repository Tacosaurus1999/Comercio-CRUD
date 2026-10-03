'use strict';

const { Usuario } = require('../../domain/entities/Usuario');
const { DomainError } = require('../../domain/errors/DomainError');

/**
 * Caso de uso: RegisterUser (Create)
 * Orquesta: validar contraseña -> cifrar -> verificar unicidad -> persistir.
 */
class RegisterUser {
  constructor(usuarioRepository, cifradoService) {
    this.usuarioRepository = usuarioRepository;
    this.cifradoService = cifradoService;
  }

  async ejecutar({ email, password, rol = 'cliente' }) {
    Usuario.validarEmail(email);
    Usuario.validarPasswordPlano(password);

    const existente = await this.usuarioRepository.buscarPorEmail(email);
    if (existente) {
      throw new DomainError('Ya existe un usuario registrado con ese correo.', 'EMAIL_DUPLICADO');
    }

    const passwordHash = await this.cifradoService.hashear(password);
    const usuario = new Usuario({ email, passwordHash, rol });
    const usuarioCreado = await this.usuarioRepository.crear(usuario);

    return usuarioCreado.toPublicJSON();
  }
}

/**
 * Caso de uso: LoginUser (Read + autenticación)
 */
class LoginUser {
  constructor(usuarioRepository, cifradoService, tokenService) {
    this.usuarioRepository = usuarioRepository;
    this.cifradoService = cifradoService;
    this.tokenService = tokenService;
  }

  async ejecutar({ email, password }) {
    if (!email || !password) {
      throw new DomainError('Correo y contraseña son obligatorios.');
    }

    const usuario = await this.usuarioRepository.buscarPorEmail(email);
    if (!usuario) {
      throw new DomainError('Credenciales inválidas.', 'CREDENCIALES_INVALIDAS');
    }

    const passwordValido = await this.cifradoService.comparar(password, usuario.passwordHash);
    if (!passwordValido) {
      throw new DomainError('Credenciales inválidas.', 'CREDENCIALES_INVALIDAS');
    }

    const token = this.tokenService.firmar({ id: usuario.id, rol: usuario.rol });

    return { usuario: usuario.toPublicJSON(), token };
  }
}

/** Caso de uso: GetUserProfile (Read del propio usuario autenticado) */
class GetUserProfile {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async ejecutar(usuarioId) {
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
    if (!usuario) {
      throw new DomainError('Usuario no encontrado.', 'USUARIO_NO_ENCONTRADO');
    }
    return usuario.toPublicJSON();
  }
}

/** Caso de uso: ListUsers (Read administrativo) */
class ListUsers {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async ejecutar() {
    const usuarios = await this.usuarioRepository.listarTodos();
    return usuarios.map((u) => u.toPublicJSON());
  }
}

/** Caso de uso: UpdateUser (Update — email y/o rol, uso administrativo) */
class UpdateUser {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async ejecutar(id, { email, rol }) {
    const existente = await this.usuarioRepository.buscarPorId(id);
    if (!existente) {
      throw new DomainError('Usuario no encontrado.', 'USUARIO_NO_ENCONTRADO');
    }

    const nuevoEmail = email ?? existente.email;
    const nuevoRol = rol ?? existente.rol;

    if (rol && !['cliente', 'admin'].includes(rol)) {
      throw new DomainError('Rol inválido. Debe ser "cliente" o "admin".');
    }

    if (email && email.toLowerCase() !== existente.email) {
      const duplicado = await this.usuarioRepository.buscarPorEmail(email);
      if (duplicado) {
        throw new DomainError('Ya existe un usuario con ese correo.', 'EMAIL_DUPLICADO');
      }
    }

    const actualizado = new Usuario({
      id: existente.id,
      email: nuevoEmail,
      passwordHash: existente.passwordHash,
      rol: nuevoRol,
    });

    const guardado = await this.usuarioRepository.actualizar(actualizado);
    return guardado.toPublicJSON();
  }
}

/** Caso de uso: DeleteUser (Delete, uso administrativo) */
class DeleteUser {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async ejecutar(id, solicitanteId) {
    if (solicitanteId && Number(solicitanteId) === Number(id)) {
      throw new DomainError('No puedes eliminar tu propia cuenta de administrador.', 'AUTOELIMINACION');
    }
    const existente = await this.usuarioRepository.buscarPorId(id);
    if (!existente) {
      throw new DomainError('Usuario no encontrado.', 'USUARIO_NO_ENCONTRADO');
    }
    await this.usuarioRepository.eliminar(id);
    return { id };
  }
}

module.exports = { RegisterUser, LoginUser, GetUserProfile, ListUsers, UpdateUser, DeleteUser };

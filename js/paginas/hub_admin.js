if (!exigirAdmin()) {
  throw new Error('Acesso restrito.');
}

montarMenu('usuarios');

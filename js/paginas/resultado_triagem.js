if (!exigirSessao()) {
  throw new Error('Sessão necessária.');
}

montarMenu('avaliacoes');

const areaErro = document.getElementById('erro_resultado');
const idAvaliacao = obterParametroUrl('id');

document.getElementById('botao_nova_avaliacao').addEventListener('click', () => {
  window.location.href = CAMINHOS.avaliacoes;
});

document.getElementById('botao_voltar').addEventListener('click', () => {
  window.location.href = CAMINHOS.painel;
});

document.getElementById('botao_imprimir').addEventListener('click', () => {
  window.print();
});

async function carregarResultado() {
  if (!idAvaliacao) {
    mostrarErro(areaErro, 'Avaliação não informada.');
    return;
  }

  try {
    const avaliacao = await requisitar('GET', `/evaluations/${idAvaliacao}`);
    const paciente = await requisitar('GET', `/patients/${avaliacao.patient_id}`);

    document.getElementById('paciente_nome').textContent = paciente.name;
    document.getElementById('paciente_idade').textContent = paciente.age;
    document.getElementById('paciente_sexo').textContent = textoSexo(paciente.sex);
    document.getElementById('paciente_observacoes').textContent = paciente.notes || '-';
    document.getElementById('pontuacao').textContent = avaliacao.score;
    document.getElementById('limiar').textContent = avaliacao.threshold_used;
    document.getElementById('resultado').textContent = textoResultado(avaliacao.result);
    document.getElementById('data_avaliacao').textContent = formatarData(avaliacao.created_at);

    const lista = document.getElementById('lista_sintomas_marcados');
    lista.innerHTML = '';
    avaliacao.symptoms
      .filter((item) => item.present)
      .forEach((item) => {
        const elemento = document.createElement('li');
        elemento.textContent = item.label;
        lista.appendChild(elemento);
      });

    esconderErro(areaErro);
  } catch (erro) {
    mostrarErro(areaErro, erro.message);
  }
}

carregarResultado();

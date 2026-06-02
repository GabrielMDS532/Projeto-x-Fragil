from __future__ import annotations

from pathlib import Path


def _escape_pdf_text(texto: str) -> str:
    return (
        texto.replace("\\\\", "\\\\\\\\")
        .replace("(", "\\\\(")
        .replace(")", "\\\\)")
        .replace("\r", "")
    )


def gerar_pdf_simples(linhas: list[str], destino: Path) -> None:
    largura = 595
    altura = 842
    margem_x = 50
    y_inicial = altura - 60
    passo = 14

    conteudo_linhas = []
    y = y_inicial
    for linha in linhas:
        if not linha.strip():
            y -= passo
            continue
        texto = _escape_pdf_text(linha.rstrip())
        conteudo_linhas.append(f"1 0 0 1 {margem_x} {y} Tm ({texto}) Tj")
        y -= passo
        if y < 60:
            break

    stream = "BT\n/F1 11 Tf\n" + "\n".join(conteudo_linhas) + "\nET\n"
    stream_bytes = stream.encode("latin-1", errors="replace")

    objetos: list[bytes] = []

    objetos.append(b"<< /Type /Catalog /Pages 2 0 R >>")
    objetos.append(b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>")
    objetos.append(
        f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {largura} {altura}] "
        f"/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>".encode("ascii")
    )
    objetos.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    objetos.append(
        f"<< /Length {len(stream_bytes)} >>\nstream\n".encode("ascii")
        + stream_bytes
        + b"endstream"
    )

    saida = bytearray()
    saida.extend(b"%PDF-1.4\n")
    offsets = [0]
    for i, obj in enumerate(objetos, start=1):
        offsets.append(len(saida))
        saida.extend(f"{i} 0 obj\n".encode("ascii"))
        saida.extend(obj)
        saida.extend(b"\nendobj\n")

    xref_inicio = len(saida)
    saida.extend(f"xref\n0 {len(objetos)+1}\n".encode("ascii"))
    saida.extend(b"0000000000 65535 f \n")
    for off in offsets[1:]:
        saida.extend(f"{off:010d} 00000 n \n".encode("ascii"))

    saida.extend(
        f"trailer\n<< /Size {len(objetos)+1} /Root 1 0 R >>\nstartxref\n{xref_inicio}\n%%EOF\n".encode(
            "ascii"
        )
    )
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_bytes(saida)


def main() -> None:
    raiz = Path(__file__).resolve().parents[1]
    arquivo_md = raiz / "docs" / "resumo_backend.md"
    destino_pdf = raiz / "docs" / "resumo_backend.pdf"
    linhas = arquivo_md.read_text(encoding="utf-8").splitlines()
    gerar_pdf_simples(linhas, destino_pdf)


if __name__ == "__main__":
    main()

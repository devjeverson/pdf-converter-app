import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pdf-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pdf-converter.component.html',
  styleUrls: ['./pdf-converter.component.scss']
})
export class PdfConverterComponent {
  pdfSelecionado!: File;
  carregando = false;
  mensagem = '';
  erro = false;

  constructor(private http: HttpClient) {}

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.pdfSelecionado = fileInput.files[0];
    }
  }

  enviarArquivo() {
    if (!this.pdfSelecionado) return;

    console.log('Enviando arquivo:', this.pdfSelecionado.name);
    console.log('Tamanho:', this.pdfSelecionado.size);
    console.log('Tipo:', this.pdfSelecionado.type);

    const formData = new FormData();
    formData.append('file', this.pdfSelecionado);

    this.carregando = true;
    this.mensagem = '';
    this.erro = false;

    console.log('Fazendo requisição para:', '/api/converter');

    this.http.post('/api/converter', formData, {
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        console.log('Sucesso! Blob recebido:', blob);
        const downloadURL = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadURL;
        a.download = 'convertido.docx';
        a.click();
        URL.revokeObjectURL(downloadURL);
        this.carregando = false;
        this.mensagem = 'Arquivo convertido com sucesso!';
        this.erro = false;
      },
      error: (error) => {
        console.error('Erro completo:', error);
        console.error('Status:', error.status);
        console.error('StatusText:', error.statusText);
        console.error('Message:', error.message);
        
        this.carregando = false;
        this.erro = true;
        
        if (error.status === 0) {
          this.mensagem = 'Erro de conexão: Verifique se o servidor está rodando na porta 8080';
        } else if (error.status === 404) {
          this.mensagem = 'Endpoint não encontrado. Verifique se a URL está correta.';
        } else if (error.status === 500) {
          this.mensagem = 'Erro interno do servidor. Verifique os logs do backend.';
        } else {
          this.mensagem = `Erro ${error.status}: ${error.statusText || 'Erro desconhecido'}`;
        }
      }
    });
  }
}


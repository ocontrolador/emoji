
#!/bin/bash

# Nome do arquivo de saída
output_file="output.json"

# Limpa o arquivo de saída caso já exista
> "$output_file"

# Loop para iterar pelos arquivos code01.txt até code11.txt
for i in $(seq -w 1 11); do
    input_file="code${i}.txt"
    
    # Verifica se o arquivo existe antes de processá-lo
    if [ -f "$input_file" ]; then
        echo "Adicionando $input_file ao $output_file"
        cat "$input_file" >> "$output_file"
    else
        echo "Arquivo $input_file não encontrado. Pulando..."
    fi
done

echo "Arquivos combinados em $output_file com sucesso!"

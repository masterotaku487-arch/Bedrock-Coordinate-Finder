#!/bin/bash

echo "🔐 Gerando Keystore para assinatura do APK..."
echo ""

KEYSTORE_FILE="bedrock-finder.keystore"
ALIAS="bedrock-finder-key"
VALIDITY=10000

keytool -genkey -v \
  -keystore $KEYSTORE_FILE \
  -alias $ALIAS \
  -keyalg RSA \
  -keysize 2048 \
  -validity $VALIDITY

echo ""
echo "✅ Keystore gerado com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Converta o keystore para base64:"
echo "   base64 $KEYSTORE_FILE | tr -d '\n' > keystore.b64"
echo ""
echo "2. Adicione os secrets no GitHub"
echo "3. IMPORTANTE: Adicione $KEYSTORE_FILE ao .gitignore"
echo "4. GUARDE o arquivo $KEYSTORE_FILE em local seguro!"

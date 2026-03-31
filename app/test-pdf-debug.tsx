import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { renderPdfFileToImages, isPdfFile } from '../utils/pdfToImages';

export default function TestPdfDebug() {
    const [logs, setLogs] = useState<string[]>([]);
    
    const addLog = (message: string) => {
        console.log(message);
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const testPdfImport = async () => {
        addLog('🧪 Starting PDF import test...');
        
        try {
            // Create a mock PDF file for testing
            const mockPdfFile = new File(
                ['mock pdf content'], 
                'test.pdf', 
                { type: 'application/pdf' }
            );
            
            addLog(`📄 Created mock file: ${mockPdfFile.name}, type: ${mockPdfFile.type}`);
            addLog(`🔍 isPdfFile check: ${isPdfFile(mockPdfFile)}`);
            
            // This should trigger the import.meta error if it exists
            addLog('🚀 About to call renderPdfFileToImages...');
            const result = await renderPdfFileToImages(mockPdfFile);
            addLog(`✅ Success! Rendered ${result.length} pages`);
            
        } catch (error) {
            addLog(`❌ ERROR: ${error instanceof Error ? error.message : String(error)}`);
            addLog(`❌ Stack: ${error instanceof Error ? error.stack : 'No stack trace'}`);
            
            // Show the error in an alert too
            Alert.alert(
                'PDF Import Error', 
                error instanceof Error ? error.message : String(error),
                [{ text: 'OK' }]
            );
        }
    };

    const testDirectImport = async () => {
        addLog('🧪 Testing direct PDF.js import...');
        
        try {
            // Test the exact import pattern that might be causing issues
            const pkgName = 'pdfjs-dist';
            const pkgPath = '/legacy/build/pdf.mjs';
            addLog(`📦 About to import: ${pkgName}${pkgPath}`);
            
            const pdfjs = await import(/* @vite-ignore */ pkgName + pkgPath);
            addLog(`✅ Direct import successful! Version: ${pdfjs.version}`);
            
        } catch (error) {
            addLog(`❌ Direct import ERROR: ${error instanceof Error ? error.message : String(error)}`);
            addLog(`❌ Direct import Stack: ${error instanceof Error ? error.stack : 'No stack trace'}`);
        }
    };

    return (
        <View style={{ padding: 20, gap: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
                PDF Import Debug Test
            </Text>
            
            <TouchableOpacity 
                onPress={testPdfImport}
                style={{ 
                    backgroundColor: '#007AFF', 
                    padding: 15, 
                    borderRadius: 8,
                    marginBottom: 10
                }}
            >
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                    Test PDF Import (Mock File)
                </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                onPress={testDirectImport}
                style={{ 
                    backgroundColor: '#34C759', 
                    padding: 15, 
                    borderRadius: 8,
                    marginBottom: 20
                }}
            >
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                    Test Direct PDF.js Import
                </Text>
            </TouchableOpacity>
            
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
                Console Logs:
            </Text>
            
            <View style={{ 
                backgroundColor: '#F5F5F5', 
                padding: 10, 
                borderRadius: 8,
                maxHeight: 300,
                overflow: 'scroll'
            }}>
                {logs.length === 0 ? (
                    <Text style={{ color: '#999' }}>No logs yet...</Text>
                ) : (
                    logs.map((log, index) => (
                        <Text key={index} style={{ fontSize: 12, marginBottom: 2 }}>
                            {log}
                        </Text>
                    ))
                )}
            </View>
            
            <TouchableOpacity 
                onPress={() => setLogs([])}
                style={{ 
                    backgroundColor: '#FF3B30', 
                    padding: 10, 
                    borderRadius: 8,
                    marginTop: 10
                }}
            >
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                    Clear Logs
                </Text>
            </TouchableOpacity>
        </View>
    );
}

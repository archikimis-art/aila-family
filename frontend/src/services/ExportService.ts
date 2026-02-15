import { Platform } from 'react-native';
import api from './api';

// Types
interface Person {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  birth_date?: string;
  death_date?: string;
  birth_place?: string;
  occupation?: string;
  notes?: string;
}

interface FamilyLink {
  person1_id: string;
  person2_id: string;
  relationship_type: string;
}

interface TreeData {
  persons: Person[];
  family_links: FamilyLink[];
}

// Fetch tree data
export const fetchTreeData = async (): Promise<TreeData> => {
  try {
    const [personsRes, linksRes] = await Promise.all([
      api.get('/persons'),
      api.get('/family-links')
    ]);
    return {
      persons: personsRes.data || [],
      family_links: linksRes.data || []
    };
  } catch (error) {
    console.error('Error fetching tree data:', error);
    throw error;
  }
};

// Generate Excel/CSV content
export const generateExcelContent = (data: TreeData): string => {
  const { persons, family_links } = data;
  
  // Header row
  let csv = 'Prénom,Nom,Genre,Date de naissance,Date de décès,Lieu de naissance,Profession,Notes\n';
  
  // Data rows
  persons.forEach(person => {
    const row = [
      person.first_name || '',
      person.last_name || '',
      person.gender === 'male' ? 'Homme' : person.gender === 'female' ? 'Femme' : 'Autre',
      person.birth_date || '',
      person.death_date || '',
      person.birth_place || '',
      person.occupation || '',
      (person.notes || '').replace(/[\n\r,]/g, ' ')
    ].map(field => `"${field}"`).join(',');
    csv += row + '\n';
  });
  
  // Add blank line and links section
  csv += '\n\nLiens familiaux\n';
  csv += 'Personne 1,Personne 2,Type de relation\n';
  
  family_links.forEach(link => {
    const person1 = persons.find(p => p.id === link.person1_id);
    const person2 = persons.find(p => p.id === link.person2_id);
    const p1Name = person1 ? `${person1.first_name} ${person1.last_name}` : 'Inconnu';
    const p2Name = person2 ? `${person2.first_name} ${person2.last_name}` : 'Inconnu';
    
    let relationType = link.relationship_type;
    if (relationType === 'parent') relationType = 'Parent de';
    else if (relationType === 'spouse') relationType = 'Conjoint(e) de';
    else if (relationType === 'sibling') relationType = 'Frère/Sœur de';
    
    csv += `"${p1Name}","${p2Name}","${relationType}"\n`;
  });
  
  return csv;
};

// Generate PDF HTML content
export const generatePDFContent = (data: TreeData): string => {
  const { persons, family_links } = data;
  
  const styles = `
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
      h1 { color: #D4AF37; text-align: center; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; }
      h2 { color: #0A1628; margin-top: 30px; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      th { background-color: #0A1628; color: white; padding: 10px; text-align: left; }
      td { padding: 8px; border-bottom: 1px solid #ddd; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      .header { display: flex; justify-content: space-between; align-items: center; }
      .date { color: #666; font-size: 12px; }
      .stats { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
      .stats span { margin-right: 30px; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    </style>
  `;
  
  const personRows = persons.map(person => `
    <tr>
      <td>${person.first_name || ''} ${person.last_name || ''}</td>
      <td>${person.gender === 'male' ? '👨 Homme' : person.gender === 'female' ? '👩 Femme' : '🧑 Autre'}</td>
      <td>${person.birth_date || '-'}</td>
      <td>${person.death_date || '-'}</td>
      <td>${person.birth_place || '-'}</td>
      <td>${person.occupation || '-'}</td>
    </tr>
  `).join('');
  
  const linkRows = family_links.map(link => {
    const person1 = persons.find(p => p.id === link.person1_id);
    const person2 = persons.find(p => p.id === link.person2_id);
    const p1Name = person1 ? `${person1.first_name} ${person1.last_name}` : 'Inconnu';
    const p2Name = person2 ? `${person2.first_name} ${person2.last_name}` : 'Inconnu';
    
    let relationType = link.relationship_type;
    let emoji = '👥';
    if (relationType === 'parent') { relationType = 'Parent de'; emoji = '👨‍👧'; }
    else if (relationType === 'spouse') { relationType = 'Conjoint(e) de'; emoji = '💑'; }
    else if (relationType === 'sibling') { relationType = 'Frère/Sœur de'; emoji = '👫'; }
    
    return `
      <tr>
        <td>${p1Name}</td>
        <td>${emoji} ${relationType}</td>
        <td>${p2Name}</td>
      </tr>
    `;
  }).join('');
  
  const today = new Date().toLocaleDateString('fr-FR');
  
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Arbre Généalogique AÏLA</title>
      ${styles}
    </head>
    <body>
      <div class="header">
        <h1>🌳 Arbre Généalogique AÏLA</h1>
      </div>
      <p class="date">Exporté le ${today} depuis www.aila.family</p>
      
      <div class="stats">
        <span><strong>👥 ${persons.length}</strong> personnes</span>
        <span><strong>🔗 ${family_links.length}</strong> liens familiaux</span>
      </div>
      
      <h2>👥 Membres de la famille</h2>
      <table>
        <thead>
          <tr>
            <th>Nom complet</th>
            <th>Genre</th>
            <th>Naissance</th>
            <th>Décès</th>
            <th>Lieu de naissance</th>
            <th>Profession</th>
          </tr>
        </thead>
        <tbody>
          ${personRows || '<tr><td colspan="6">Aucune personne dans l\'arbre</td></tr>'}
        </tbody>
      </table>
      
      <h2>🔗 Liens familiaux</h2>
      <table>
        <thead>
          <tr>
            <th>Personne 1</th>
            <th>Relation</th>
            <th>Personne 2</th>
          </tr>
        </thead>
        <tbody>
          ${linkRows || '<tr><td colspan="3">Aucun lien familial</td></tr>'}
        </tbody>
      </table>
      
      <p style="margin-top: 40px; text-align: center; color: #888; font-size: 12px;">
        Généré par AÏLA - Arbre Généalogique Familial<br>
        www.aila.family
      </p>
    </body>
    </html>
  `;
};

// Download file (Web only)
const downloadFile = (content: string, filename: string, mimeType: string): boolean => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    console.log('Download only available on web');
    return false;
  }
  
  try {
    // Add BOM for Excel UTF-8 compatibility
    const BOM = mimeType.includes('csv') ? '\uFEFF' : '';
    const fullContent = BOM + content;
    
    // Create blob and download
    const blob = new Blob([fullContent], { type: mimeType + ';charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
    
    return true;
  } catch (error) {
    console.error('Download error:', error);
    
    // Fallback: open in new tab
    try {
      const dataUri = 'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(content);
      window.open(dataUri, '_blank');
      return true;
    } catch (fallbackError) {
      console.error('Fallback download error:', fallbackError);
      return false;
    }
  }
};

// Print PDF (opens print dialog)
export const printPDF = async (): Promise<boolean> => {
  if (Platform.OS !== 'web') {
    console.log('Print only available on web');
    return false;
  }
  
  try {
    const data = await fetchTreeData();
    const htmlContent = generatePDFContent(data);
    
    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
      
      // Fallback if onload doesn't fire
      setTimeout(() => {
        printWindow.print();
      }, 1000);
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Print PDF error:', error);
    return false;
  }
};

// Export to Excel (CSV format compatible with Excel)
export const exportToExcel = async (): Promise<boolean> => {
  try {
    const data = await fetchTreeData();
    const csvContent = generateExcelContent(data);
    const filename = `arbre_genealogique_aila_${new Date().toISOString().split('T')[0]}.csv`;
    return downloadFile(csvContent, filename, 'text/csv;charset=utf-8');
  } catch (error) {
    console.error('Export Excel error:', error);
    return false;
  }
};

// Export to PDF (downloads HTML that can be printed as PDF)
export const exportToPDF = async (): Promise<boolean> => {
  try {
    const data = await fetchTreeData();
    const htmlContent = generatePDFContent(data);
    const filename = `arbre_genealogique_aila_${new Date().toISOString().split('T')[0]}.html`;
    return downloadFile(htmlContent, filename, 'text/html;charset=utf-8');
  } catch (error) {
    console.error('Export PDF error:', error);
    return false;
  }
};

export default {
  fetchTreeData,
  generateExcelContent,
  generatePDFContent,
  printPDF,
  exportToExcel,
  exportToPDF
};

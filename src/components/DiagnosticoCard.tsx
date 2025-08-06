import React from 'react';

const DiagnosticoCard = () => {
  const styles: { [key: string]: React.CSSProperties } = {
    body: {
      backgroundColor: '#eaf6ff',
      fontFamily: 'Arial, sans-serif',
      height: '100vh',
      margin: 0,
      padding: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      backgroundColor: '#ffffff',
      padding: '60px',
      borderRadius: '24px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      width: '600px',
      textAlign: 'left',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '600px',
    },
    img: {
      width: '48px',
      marginBottom: '25px',
    },
    title: {
      color: '#63b3ed',
      fontSize: '28px',
      marginBottom: '30px',
    },
    ul: {
      listStyle: 'disc',
      paddingLeft: '25px',
      color: '#333',
      fontSize: '18px',
      marginBottom: '50px',
    },
    li: {
      marginBottom: '14px',
    },
    button: {
      backgroundColor: '#63b3ed',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      padding: '14px 28px',
      fontSize: '18px',
      cursor: 'pointer',
      alignSelf: 'flex-start',
      transition: 'background-color 0.3s ease',
      marginBottom: '15px',
    },
    link: {
      backgroundColor: '#63b3ed',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '10px',
      padding: '14px 28px',
      fontSize: '18px',
      display: 'inline-block',
      alignSelf: 'flex-start',
    },
  };

  const whatsappLink =
    'https://wa.me/5588992347927?text=Olá!%20Gostaria%20de%20falar%20sobre%20o%20diagnóstico.';

  return (
    <div style={styles.body}>
      <div style={styles.card}>
        <div>
          <img
            src="https://img.icons8.com/ios-filled/50/000000/heart-health.png"
            alt="ícone diagnóstico"
            style={styles.img}
          />
          <h3 style={styles.title}>Diagnóstico</h3>
          <ul style={styles.ul}>
            <li style={styles.li}>Mapeamento emocional da equipe</li>
            <li style={styles.li}>Relatório para o RH com plano de ação</li>
            <li style={styles.li}>Análise de clima e engajamento</li>
          </ul>
        </div>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.link}
        >
          Entre em contato
        </a>
      </div>
    </div>
  );
};

export default DiagnosticoCard;

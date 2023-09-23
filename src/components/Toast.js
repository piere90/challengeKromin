import React, { useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import SVGsadFace from '../assets/images/emoji-sad.svg';
import SVGcloseToast from '../assets/images/close-toast.svg';
import SVGcheckToast from '../assets/images/check-circle.svg';
import '../assets/Toast.css';

const useStyles = createUseStyles({
    toastContainer: {
      width: '100%',
      height: '100%',
      padding: '10px',
      borderRadius: '11px',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: '10px',
      display: 'inline-flex'
    },  
    error: {
        backgroundColor: 'rgba(205, 43, 49, 0.80)',
    },
    success: {
        backgroundColor: 'rgba(24, 121, 78, 0.8)',
    },
    iconContainer: {
      width: '24px',
      height: '24px',
      padding: '4px',
      justifyContent: 'center',
      alignItems: 'center',
      display: 'flex',
    },
    icon: {
      width: '16px',
      height: '16px',
    },
    messageContainer: {
      color: 'white',
      fontSize: '14px',
      fontFamily: 'Helvetica Now Display',
      fontWeight: 700,
      letterSpacing: '0.30px',
      wordWrap: 'break-word',
    },
    checkmarkContainer: {
      width: '14px',
      height: '14px',
      position: 'relative',
    },
    checkmark: {
      width: '14px',
      height: '14px',
      left: '3.50px',
      top: '-2.5px',
      position: 'absolute'
    },
  });

const Toast = ({ open, title, type, onClose }) => {

    const classes = useStyles(type);

    // Determino quale SVG deve essere utilizzata in base al tipo di messaggio
    const svgSource = type === 'error' ? SVGsadFace : SVGcheckToast;

    // Determino quale classe CSS utilizzare in base al tipo di messaggio
    const backgroundClassName = type === 'error' ? classes.error : classes.success;

  useEffect(() => {
    if (open) {
      // Chiudo il Toast dopo un certo periodo di tempo (ad esempio, 5 secondi)
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [open, onClose]);

  return (
    <div className={`toast ${open ? 'show' : ''}`}>
        <div className={`${classes.toastContainer} ${backgroundClassName}`}>
        <div className={classes.iconContainer}>
            <img
            className={classes.icon}
            src={svgSource}
            alt="Placeholder"
            />
        </div>
        <div className={classes.messageContainer}>{title}</div>
        <div className={classes.checkmarkContainer}>
            <img src={SVGcloseToast} className={classes.checkmark}></img>
        </div>
        </div>
    </div>
  );
};

// Imposto un valore predefinito per la prop type
Toast.defaultProps = {
    type: 'default',
};

export default Toast;

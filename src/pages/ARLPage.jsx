import { ARLMain } from '../modules/arl/components/ARLMain.jsx';

export default function ARLPage({ patients, companies, currentUser, showAlert, showConfirm }) {
  return (
    <ARLMain 
      patients={patients}
      companies={companies}
      currentUser={currentUser}
      showAlert={showAlert}
      showConfirm={showConfirm}
    />
  );
}



user(id,nom,prenom,password,adresse,telephone,file_cni,cni,date_naissance,code_verification
,role(admin, client, agence),statut_compte,qrcode)

transaction(id, sender_id, montant,type_transaction(depot ou retrait,transfert,paiement,Recharge_credit),statut(valider ou annuler), 
frais_id, receiver_id, createdAt, updatedAt)

frais(id,valeur(1%))

wallet(id, user_id, solde, createdAt, updatedAt)


notification(id,notifier_id,notified_id, titre, message, statut, createdAt,id_transaction)

fournisseur(id,libelle,logo,user_id)

type_contrat(id,libelle, desciption,pourcentage)

contrat_fournisseur(id,user_id,fournisseur_id,date_debut,date_fin,id_type_contrat)
contrat_banque(id,user_id,banque_id,date_debut,date_fin,id_type_contrat)

paiement(id,id_transaction)

Banque(id,libelle,logo)

user_banque(id,user_id,banque_id,code,etat(active,inactive))

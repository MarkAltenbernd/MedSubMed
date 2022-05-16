# Mediator Subscription Mediator – What It Is and What It Is Not #
Media Subscription Mediator (MedSubMed or simply MSM) is not conceived as a commercial product. Rather it is a training challenge that I have defined for myself to help me become proficient with Ethereum and Solidity, as well as collateral technologies. 

I have long believed that the only way to really learn a technology is to build an application end-to-end. Tutorials and lab exercises can be useful for gaining initial access to a new technology, but only a sustained development effort can lead to mastery. 

In evaluating MSM, please focus on the technical design of the ÐApp and the quality of the Solidity and JavaScript code. Please try not to focus on product definition and strategy, as there really isn’t any. 

# Media Subscription Mediator Distributed Application – Description #
The Media Subscription Mediator is a managed distributed application that a media Publisher uses to mediate anonymous Subscription access to Publications comprising various kinds of media that he owns, manages, and/or maintains. 

MSM is a distributed Ethereum application (a ÐApp) used as an underlying engine that facilitates the creation and management of Internet-based applications that mediate subscriptions to media content. The MSM engine is run by an MSM Owner. For his implementation, each Owner should create and enforce application policy, create an Internet-based front-end application UI, and select an external DBMS to store subscription content. 

MSM contemplates three classes of users in addition to the Owner: Managers, Publishers, and Subscribers; all must be holders of Ethereum Externally Owner Accounts (EOAs) on the same Ethereum network that hosts the MSM ÐApp. 

The Owner uses the MSMFactory contract to create and own a specific instance, or presence, of MSM. The Owner then uses the Factory to create one or more individual MSMFacades. The Façade is the context within which Managers and Publishers are designated and Publications and Subscriptions defined. 

Publishers enroll content via metadata in the MSM system and store content in an external database (possibly with the assistance of the Manager), and Subscribers select content that they wish to view; then they may subscribe to that content. 

Each Publication has the price of a Subscription associated with it. When a Subscription is created, the price is transferred from the Subscriber’s account to the Publisher’s account. In addition a transaction fee is transferred from the Publisher’s EOA to the Manager’s. 

The MSM application:

- permits users to register as Publishers
- permits Publishers to enroll media content as Publications
- associates enrolled Publications with one or more descriptive MediaLists
- accepts Subscriptions from Subscribers (Ethereum accounts/users) to Publications in a MediaList
- transfers ETH from Subscribers to Publishers in payment of Subscriptions and a transaction fee to the Manager
- permits users to request access to Publications to which they have an active Subscription


The public UI of MSM centers on MediaList, a list of lists. Each item in that list is itself a list comprising a number of Publication content items that have a characteristic or attribute in common. That attribute is contained in the MedaList’s locus property, a string field that contains the common attribute of elements of the list, e.g. *Maria Carey, New England Patriots, French Renaissance Poetry, Whatever*. 

An instance of a MediaList object must be created by a Manager before Publication content can be enrolled in that list. There is a many-to-many relationship between Publication and MediaList: one Publication can appear in several MediaLists and one MediaList can and is expected to refer to many Publications. 

The Publication class contains only metadata about content. Due to considerations of scalability, cost, and performance, the actual media content is stored in an external database management system of some sort. 

MSM is agnostic about the creation of MediaList and Publication objects. The ability to create and edit these objects should be enabled and managed through the UI of an implementing application, e.g. through a browser-based app built with React. 

MSM makes no assumption about the monitoring and management of its enrolled content. It is for the implementing application to make and enforce rules about the nature of permitted content and to screen out offending content, e.g. pornography, political disinformation, and so on. 

The implementing applications also is responsible for providing access to external software that renders the Publication’s content. 

When  enrolling content into MedSubMed, the Publisher associates each element of content with one or more MediaLists; a single Publication can be contained on many lists. 

Each item in Publication has associated with it a term for the Subscription, that is, the length of time that a Subscription to the item will be active from the time of Subscription activation, and a price for the Subscription for term length of time. The length of the term could be eternal, meaning that the Subscriber has bought rather than rented access to the content.

In addition each Publication will have a mandatory title property and an optional description property to make the content of the MediaList meaningful to a human visitor. 

Within a given Ethereum network, there can be multiple deployed instances of the MSMFactory contract. Each factory can generate multiple instances of the MSMFacade contract. All important MSMObjects – Publisher, Subscribers, MediaLists, and so on – exist within the context of a façade. Facades are discrete and separate from each other, and there is no communication among them. 

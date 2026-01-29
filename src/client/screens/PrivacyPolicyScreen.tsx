import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';

interface PrivacyPolicyScreenProps {
  onBack: () => void;
}

const SUPPORT_EMAIL = 'support@bluebridge.com';
const DATA_REQUEST_URL = 'https://app.termly.io/dsar/d6487265-bb57-4664-990b-3602e2cacf13';
const STRIPE_PRIVACY_URL = 'https://stripe.com/privacy';

export const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onBack }) => {
  const handleEmailPress = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  };

  const handleDataRequestPress = () => {
    Linking.openURL(DATA_REQUEST_URL);
  };

  const handleStripePrivacyPress = () => {
    Linking.openURL(STRIPE_PRIVACY_URL);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Title and Last Updated */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Privacy Policy</Text>
            <Text style={styles.lastUpdated}>Last updated January 12, 2026</Text>
          </View>

          {/* Introduction */}
          <View style={styles.section}>
            <Text style={styles.bodyText}>
              This Privacy Notice for BlueBridge ("we," "us," or "our"), describes how and why we 
              might access, collect, store, use, and/or share ("process") your personal information 
              when you use our services ("Services"), including when you:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>
                • Download and use our mobile application (BlueBridge) or any other application of 
                  ours that links to this Privacy Notice
              </Text>
              <Text style={styles.bulletItem}>
                • Engage with us in other related ways, including any marketing or events
              </Text>
            </View>
            <Text style={styles.bodyText}>
              <Text style={styles.bold}>Questions or concerns?</Text> Reading this Privacy Notice 
              will help you understand your privacy rights and choices. If you do not agree with 
              our policies and practices, please do not use our Services. If you still have any 
              questions or concerns, please contact us at{' '}
              <Text style={styles.link} onPress={handleEmailPress}>
                {SUPPORT_EMAIL}
              </Text>
              .
            </Text>
          </View>

          {/* Summary of Key Points */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary of Key Points</Text>
            <Text style={styles.bodyText}>
              <Text style={styles.bold}>What personal information do we process?</Text> When you 
              visit, use, or navigate our Services, we may process personal information depending 
              on how you interact with us and the Services, the choices you make, and the products 
              and features you use.
            </Text>
            <Text style={styles.bodyText}>
              <Text style={styles.bold}>Do we process any sensitive personal information?</Text>{' '}
              We may process sensitive personal information when necessary with your consent or as 
              otherwise permitted by applicable law.
            </Text>
            <Text style={styles.bodyText}>
              <Text style={styles.bold}>Do we collect any information from third parties?</Text>{' '}
              We do not collect any information from third parties.
            </Text>
            <Text style={styles.bodyText}>
              <Text style={styles.bold}>How do we process your information?</Text> We process your 
              information to provide, improve, and administer our Services, communicate with you, 
              for security and fraud prevention, and to comply with law.
            </Text>
            <Text style={styles.bodyText}>
              <Text style={styles.bold}>How do we keep your information safe?</Text> We have 
              adequate organizational and technical processes and procedures in place to protect 
              your personal information.
            </Text>
            <Text style={styles.bodyText}>
              <Text style={styles.bold}>What are your rights?</Text> Depending on where you are 
              located geographically, the applicable privacy law may mean you have certain rights 
              regarding your personal information.
            </Text>
            <Text style={styles.bodyText}>
              <Text style={styles.bold}>How do you exercise your rights?</Text> The easiest way 
              to exercise your rights is by submitting a{' '}
              <Text style={styles.link} onPress={handleDataRequestPress}>
                data subject access request
              </Text>
              , or by contacting us.
            </Text>
          </View>

          {/* Table of Contents */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Table of Contents</Text>
            <View style={styles.tocList}>
              <Text style={styles.tocItem}>1. What Information Do We Collect?</Text>
              <Text style={styles.tocItem}>2. How Do We Process Your Information?</Text>
              <Text style={styles.tocItem}>3. When and With Whom Do We Share Your Personal Information?</Text>
              <Text style={styles.tocItem}>4. How Do We Handle Your Social Logins?</Text>
              <Text style={styles.tocItem}>5. How Long Do We Keep Your Information?</Text>
              <Text style={styles.tocItem}>6. How Do We Keep Your Information Safe?</Text>
              <Text style={styles.tocItem}>7. What Are Your Privacy Rights?</Text>
              <Text style={styles.tocItem}>8. Controls for Do-Not-Track Features</Text>
              <Text style={styles.tocItem}>9. Do United States Residents Have Specific Privacy Rights?</Text>
              <Text style={styles.tocItem}>10. Do We Make Updates to This Notice?</Text>
              <Text style={styles.tocItem}>11. How Can You Contact Us About This Notice?</Text>
              <Text style={styles.tocItem}>12. How Can You Review, Update, or Delete the Data We Collect From You?</Text>
            </View>
          </View>

          {/* Section 1 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. What Information Do We Collect?</Text>
            <Text style={styles.subsectionTitle}>Personal information you disclose to us</Text>
            <Text style={styles.inShort}>
              <Text style={styles.bold}>In Short:</Text> We collect personal information that you 
              provide to us.
            </Text>
            <Text style={styles.bodyText}>
              We collect personal information that you voluntarily provide to us when you register 
              on the Services, express an interest in obtaining information about us or our products 
              and Services, when you participate in activities on the Services, or otherwise when 
              you contact us.
            </Text>
            <Text style={styles.bodyText}>
              <Text style={styles.bold}>Personal Information Provided by You.</Text> The personal 
              information we collect may include:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Email addresses</Text>
              <Text style={styles.bulletItem}>• Names</Text>
              <Text style={styles.bulletItem}>• Billing addresses</Text>
              <Text style={styles.bulletItem}>• Contact or authentication data</Text>
              <Text style={styles.bulletItem}>• Debit/credit card numbers</Text>
              <Text style={styles.bulletItem}>• Phone numbers</Text>
            </View>
            <Text style={styles.bodyText}>
              <Text style={styles.bold}>Sensitive Information.</Text> When necessary, with your 
              consent or as otherwise permitted by applicable law, we process the following 
              categories of sensitive information:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Social security numbers or other government identifiers</Text>
            </View>
            <Text style={styles.bodyText}>
              <Text style={styles.bold}>Payment Data.</Text> We may collect data necessary to 
              process your payment if you choose to make purchases, such as your payment instrument 
              number, and the security code associated with your payment instrument. All payment 
              data is handled and stored by Stripe. You may find their privacy notice at{' '}
              <Text style={styles.link} onPress={handleStripePrivacyPress}>
                {STRIPE_PRIVACY_URL}
              </Text>
              .
            </Text>
            <Text style={styles.bodyText}>
              <Text style={styles.bold}>Social Media Login Data.</Text> We may provide you with 
              the option to register with us using your existing social media account details. 
              If you choose to register in this way, we will collect certain profile information 
              about you from the social media provider.
            </Text>
            <Text style={styles.bodyText}>
              <Text style={styles.bold}>Application Data.</Text> If you use our application(s), 
              we may also collect the following information if you choose to provide us with 
              access or permission:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>
                • <Text style={styles.italic}>Geolocation Information.</Text> We may request access 
                to track location-based information from your mobile device to provide certain 
                location-based services.
              </Text>
              <Text style={styles.bulletItem}>
                • <Text style={styles.italic}>Mobile Device Access.</Text> We may request access 
                to certain features from your mobile device, including your calendar, camera, 
                microphone, reminders, and SMS messages.
              </Text>
              <Text style={styles.bulletItem}>
                • <Text style={styles.italic}>Push Notifications.</Text> We may request to send 
                you push notifications regarding your account or certain features of the application(s).
              </Text>
            </View>
            <Text style={styles.subsectionTitle}>Information automatically collected</Text>
            <Text style={styles.inShort}>
              <Text style={styles.bold}>In Short:</Text> Some information — such as your Internet 
              Protocol (IP) address and/or browser and device characteristics — is collected 
              automatically when you visit our Services.
            </Text>
            <Text style={styles.bodyText}>
              We automatically collect certain information when you visit, use, or navigate the 
              Services. This information does not reveal your specific identity but may include 
              device and usage information, such as your IP address, browser and device 
              characteristics, operating system, language preferences, referring URLs, device name, 
              country, location, and information about how and when you use our Services.
            </Text>
          </View>

          {/* Section 2 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. How Do We Process Your Information?</Text>
            <Text style={styles.inShort}>
              <Text style={styles.bold}>In Short:</Text> We process your information to provide, 
              improve, and administer our Services, communicate with you, for security and fraud 
              prevention, and to comply with law.
            </Text>
            <Text style={styles.bodyText}>
              We process your personal information for a variety of reasons, including:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>
                • <Text style={styles.bold}>To facilitate account creation and authentication</Text> and 
                otherwise manage user accounts.
              </Text>
              <Text style={styles.bulletItem}>
                • <Text style={styles.bold}>To deliver and facilitate delivery of services</Text> to the user.
              </Text>
              <Text style={styles.bulletItem}>
                • <Text style={styles.bold}>To enable user-to-user communications</Text> if you 
                choose to use any of our offerings that allow for communication with another user.
              </Text>
              <Text style={styles.bulletItem}>
                • <Text style={styles.bold}>To request feedback</Text> and to contact you about 
                your use of our Services.
              </Text>
              <Text style={styles.bulletItem}>
                • <Text style={styles.bold}>To send you marketing and promotional communications</Text>{' '}
                if this is in accordance with your marketing preferences.
              </Text>
              <Text style={styles.bulletItem}>
                • <Text style={styles.bold}>To protect our Services</Text> including fraud 
                monitoring and prevention.
              </Text>
              <Text style={styles.bulletItem}>
                • <Text style={styles.bold}>To evaluate and improve our Services</Text>, products, 
                marketing, and your experience.
              </Text>
              <Text style={styles.bulletItem}>
                • <Text style={styles.bold}>To comply with our legal obligations</Text> and 
                respond to legal requests.
              </Text>
            </View>
          </View>

          {/* Section 3 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. When and With Whom Do We Share Your Personal Information?</Text>
            <Text style={styles.inShort}>
              <Text style={styles.bold}>In Short:</Text> We may share information in specific 
              situations and with specific third parties.
            </Text>
            <Text style={styles.bodyText}>
              We may need to share your personal information in the following situations:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>
                • <Text style={styles.bold}>Business Transfers.</Text> We may share or transfer 
                your information in connection with any merger, sale of company assets, financing, 
                or acquisition.
              </Text>
              <Text style={styles.bulletItem}>
                • <Text style={styles.bold}>Affiliates.</Text> We may share your information with 
                our affiliates, in which case we will require those affiliates to honor this 
                Privacy Notice.
              </Text>
              <Text style={styles.bulletItem}>
                • <Text style={styles.bold}>Business Partners.</Text> We may share your information 
                with our business partners to offer you certain products, services, or promotions.
              </Text>
              <Text style={styles.bulletItem}>
                • <Text style={styles.bold}>Other Users.</Text> When you share personal information 
                or otherwise interact with public areas of the Services, such personal information 
                may be viewed by all users.
              </Text>
            </View>
          </View>

          {/* Section 4 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. How Do We Handle Your Social Logins?</Text>
            <Text style={styles.inShort}>
              <Text style={styles.bold}>In Short:</Text> If you choose to register or log in to 
              our Services using a social media account, we may have access to certain information 
              about you.
            </Text>
            <Text style={styles.bodyText}>
              Our Services offer you the ability to register and log in using your third-party 
              social media account details (like your Facebook or X logins). Where you choose to 
              do this, we will receive certain profile information about you from your social 
              media provider. The profile information we receive may vary depending on the social 
              media provider but will often include your name, email address, friends list, and 
              profile picture.
            </Text>
            <Text style={styles.bodyText}>
              We will use the information we receive only for the purposes that are described in 
              this Privacy Notice or that are otherwise made clear to you on the relevant Services.
            </Text>
          </View>

          {/* Section 5 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. How Long Do We Keep Your Information?</Text>
            <Text style={styles.inShort}>
              <Text style={styles.bold}>In Short:</Text> We keep your information for as long as 
              necessary to fulfill the purposes outlined in this Privacy Notice unless otherwise 
              required by law.
            </Text>
            <Text style={styles.bodyText}>
              We will only keep your personal information for as long as it is necessary for the 
              purposes set out in this Privacy Notice, unless a longer retention period is required 
              or permitted by law. No purpose in this notice will require us keeping your personal 
              information for longer than <Text style={styles.bold}>three (3) months past the 
              termination of the user's account</Text>.
            </Text>
            <Text style={styles.bodyText}>
              When we have no ongoing legitimate business need to process your personal information, 
              we will either delete or anonymize such information, or, if this is not possible, 
              then we will securely store your personal information and isolate it from any further 
              processing until deletion is possible.
            </Text>
          </View>

          {/* Section 6 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. How Do We Keep Your Information Safe?</Text>
            <Text style={styles.inShort}>
              <Text style={styles.bold}>In Short:</Text> We aim to protect your personal 
              information through a system of organizational and technical security measures.
            </Text>
            <Text style={styles.bodyText}>
              We have implemented appropriate and reasonable technical and organizational security 
              measures designed to protect the security of any personal information we process. 
              However, despite our safeguards and efforts to secure your information, no electronic 
              transmission over the Internet or information storage technology can be guaranteed 
              to be 100% secure. Although we will do our best to protect your personal information, 
              transmission of personal information to and from our Services is at your own risk. 
              You should only access the Services within a secure environment.
            </Text>
          </View>

          {/* Section 7 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. What Are Your Privacy Rights?</Text>
            <Text style={styles.inShort}>
              <Text style={styles.bold}>In Short:</Text> You may review, change, or terminate 
              your account at any time, depending on your country, province, or state of residence.
            </Text>
            <Text style={styles.bodyText}>
              <Text style={styles.bold}>Withdrawing your consent:</Text> If we are relying on 
              your consent to process your personal information, you have the right to withdraw 
              your consent at any time. You can withdraw your consent at any time by contacting 
              us using the contact details provided in the section "How Can You Contact Us About 
              This Notice?" below.
            </Text>
            <Text style={styles.bodyText}>
              <Text style={styles.bold}>Opting out of marketing and promotional communications:</Text>{' '}
              You can unsubscribe from our marketing and promotional communications at any time by 
              clicking on the unsubscribe link in the emails that we send, replying "STOP" or 
              "UNSUBSCRIBE" to the SMS messages that we send, or by contacting us.
            </Text>
            <Text style={styles.subsectionTitle}>Account Information</Text>
            <Text style={styles.bodyText}>
              If you would at any time like to review or change the information in your account or 
              terminate your account, you can log in to your account settings and update your user 
              account.
            </Text>
            <Text style={styles.bodyText}>
              Upon your request to terminate your account, we will deactivate or delete your 
              account and information from our active databases. However, we may retain some 
              information in our files to prevent fraud, troubleshoot problems, assist with any 
              investigations, enforce our legal terms and/or comply with applicable legal 
              requirements.
            </Text>
            <Text style={styles.bodyText}>
              If you have questions or comments about your privacy rights, you may email us at{' '}
              <Text style={styles.link} onPress={handleEmailPress}>
                {SUPPORT_EMAIL}
              </Text>
              .
            </Text>
          </View>

          {/* Section 8 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Controls for Do-Not-Track Features</Text>
            <Text style={styles.bodyText}>
              Most web browsers and some mobile operating systems and mobile applications include 
              a Do-Not-Track ("DNT") feature or setting you can activate to signal your privacy 
              preference not to have data about your online browsing activities monitored and 
              collected. At this stage, no uniform technology standard for recognizing and 
              implementing DNT signals has been finalized. As such, we do not currently respond 
              to DNT browser signals or any other mechanism that automatically communicates your 
              choice not to be tracked online.
            </Text>
            <Text style={styles.bodyText}>
              California law requires us to let you know how we respond to web browser DNT signals. 
              Because there currently is not an industry or legal standard for recognizing or 
              honoring DNT signals, we do not respond to them at this time.
            </Text>
          </View>

          {/* Section 9 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Do United States Residents Have Specific Privacy Rights?</Text>
            <Text style={styles.inShort}>
              <Text style={styles.bold}>In Short:</Text> If you are a resident of California, 
              Colorado, Connecticut, Delaware, Florida, Indiana, Iowa, Kentucky, Maryland, 
              Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregon, Rhode Island, 
              Tennessee, Texas, Utah, or Virginia, you may have the right to request access to 
              and receive details about the personal information we maintain about you.
            </Text>
            <Text style={styles.bodyText}>
              You may have rights including:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Right to know whether or not we are processing your personal data</Text>
              <Text style={styles.bulletItem}>• Right to access your personal data</Text>
              <Text style={styles.bulletItem}>• Right to correct inaccuracies in your personal data</Text>
              <Text style={styles.bulletItem}>• Right to request the deletion of your personal data</Text>
              <Text style={styles.bulletItem}>• Right to obtain a copy of the personal data you previously shared with us</Text>
              <Text style={styles.bulletItem}>• Right to non-discrimination for exercising your rights</Text>
              <Text style={styles.bulletItem}>• Right to opt out of targeted advertising, sale of personal data, or profiling</Text>
            </View>
            <Text style={styles.subsectionTitle}>How to Exercise Your Rights</Text>
            <Text style={styles.bodyText}>
              To exercise these rights, you can contact us by submitting a{' '}
              <Text style={styles.link} onPress={handleDataRequestPress}>
                data subject access request
              </Text>
              , by emailing us at{' '}
              <Text style={styles.link} onPress={handleEmailPress}>
                {SUPPORT_EMAIL}
              </Text>
              , or by referring to the contact details at the bottom of this document.
            </Text>
          </View>

          {/* Section 10 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Do We Make Updates to This Notice?</Text>
            <Text style={styles.inShort}>
              <Text style={styles.bold}>In Short:</Text> Yes, we will update this notice as 
              necessary to stay compliant with relevant laws.
            </Text>
            <Text style={styles.bodyText}>
              We may update this Privacy Notice from time to time. The updated version will be 
              indicated by an updated "Revised" date at the top of this Privacy Notice. If we 
              make material changes to this Privacy Notice, we may notify you either by prominently 
              posting a notice of such changes or by directly sending you a notification. We 
              encourage you to review this Privacy Notice frequently to be informed of how we are 
              protecting your information.
            </Text>
          </View>

          {/* Section 11 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. How Can You Contact Us About This Notice?</Text>
            <Text style={styles.bodyText}>
              If you have questions or comments about this notice, you may email us at{' '}
              <Text style={styles.link} onPress={handleEmailPress}>
                {SUPPORT_EMAIL}
              </Text>{' '}
              or contact us by post at:
            </Text>
            <View style={styles.addressBlock}>
              <Text style={styles.bodyText}>BlueBridge</Text>
            </View>
          </View>

          {/* Section 12 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. How Can You Review, Update, or Delete the Data We Collect From You?</Text>
            <Text style={styles.bodyText}>
              You have the right to request access to the personal information we collect from you, 
              details about how we have processed it, correct inaccuracies, or delete your personal 
              information. You may also have the right to withdraw your consent to our processing 
              of your personal information. To request to review, update, or delete your personal 
              information, please fill out and submit a{' '}
              <Text style={styles.link} onPress={handleDataRequestPress}>
                data subject access request
              </Text>
              .
            </Text>
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  titleSection: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  lastUpdated: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  subsectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  inShort: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.md,
    backgroundColor: colors.gray100,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  bodyText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  bulletList: {
    marginLeft: spacing.md,
    marginBottom: spacing.md,
  },
  bulletItem: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  tocList: {
    gap: spacing.sm,
  },
  tocItem: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    lineHeight: 24,
  },
  bold: {
    fontWeight: typography.fontWeight.bold,
  },
  italic: {
    fontStyle: 'italic',
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  addressBlock: {
    marginTop: spacing.sm,
    paddingLeft: spacing.md,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});

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
import { Header } from '../../shared/components/Header';
import { Card } from '../../shared/components/Card';

export const WorkerSupportScreen: React.FC = () => {
  const handleCall = () => {
    Linking.openURL('tel:5551234567');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@bluebridge.com');
  };

  const handleChat = () => {
    // This would open a chat modal in production
    console.log('Open chat');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Header title="Support" subtitle="We're here to help" />

        <View style={styles.content}>
          {/* Contact Methods Card */}
          <Card style={styles.contactCard}>
            <Text style={styles.sectionTitle}>Get in Touch</Text>
            
            <TouchableOpacity style={styles.contactRow} onPress={handleCall} activeOpacity={0.7}>
              <View style={styles.contactIconContainer}>
                <Feather name="phone" size={20} color={colors.primary} />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactTitle}>Call Us</Text>
                <Text style={styles.contactSubtitle}>(555) 123-4567</Text>
                <Text style={styles.contactHours}>Mon-Fri 8am-8pm EST</Text>
              </View>
              <Feather name="arrow-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.contactRow} onPress={handleEmail} activeOpacity={0.7}>
              <View style={styles.contactIconContainer}>
                <Feather name="mail" size={20} color={colors.primary} />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactTitle}>Email Us</Text>
                <Text style={styles.contactSubtitle}>support@bluebridge.com</Text>
                <Text style={styles.contactHours}>Response within 24 hours</Text>
              </View>
              <Feather name="arrow-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.contactRow} onPress={handleChat} activeOpacity={0.7}>
              <View style={styles.contactIconContainer}>
                <Feather name="message-circle" size={20} color={colors.primary} />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactTitle}>Live Chat</Text>
                <Text style={styles.contactSubtitle}>Chat with our team</Text>
                <Text style={styles.contactHours}>Average wait: 3 min</Text>
              </View>
              <Feather name="arrow-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </Card>

          {/* FAQ Section - Worker Specific */}
          <Card style={styles.faqCard}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            
            <TouchableOpacity style={styles.faqRow} activeOpacity={0.7}>
              <Text style={styles.faqQuestion}>How do I submit a job offer?</Text>
              <Text style={styles.faqIcon}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />

            <TouchableOpacity style={styles.faqRow} activeOpacity={0.7}>
              <Text style={styles.faqQuestion}>When do I get paid?</Text>
              <Text style={styles.faqIcon}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />

            <TouchableOpacity style={styles.faqRow} activeOpacity={0.7}>
              <Text style={styles.faqQuestion}>How do I update my services?</Text>
              <Text style={styles.faqIcon}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />

            <TouchableOpacity style={styles.faqRow} activeOpacity={0.7}>
              <Text style={styles.faqQuestion}>What if a client cancels?</Text>
              <Text style={styles.faqIcon}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />

            <TouchableOpacity style={styles.faqRow} activeOpacity={0.7}>
              <Text style={styles.faqQuestion}>How do reviews work?</Text>
              <Text style={styles.faqIcon}>›</Text>
            </TouchableOpacity>
          </Card>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  contactCard: {
    padding: spacing.xl,
  },
  faqCard: {
    padding: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  contactSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  contactHours: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: spacing.md,
  },
  faqRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  faqQuestion: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  faqIcon: {
    fontSize: 24,
    color: colors.textSecondary,
    marginLeft: spacing.md,
  },
});
